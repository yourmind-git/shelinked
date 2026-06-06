import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id },
    include: { result: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assessment);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = await req.json();
  const profile = await prisma.careerProfile.findUnique({ where: { userId: session.user.id } });

  const profileContext = profile
    ? `User: ${profile.currentRole} in ${profile.industry}, ${profile.yearsExperience} years experience. Goals: ${profile.careerGoals}`
    : "No profile provided";

  const scorePrompt = `You are a leadership assessment expert. Based on these assessment answers and user context, generate a leadership evaluation.

User context: ${profileContext}

Assessment answers (1-5 scale, 5=strongest):
${JSON.stringify(answers, null, 2)}

Respond with ONLY a JSON object with this exact structure:
{
  "leadershipScore": <integer 0-100>,
  "promotionReadiness": "<High|Medium|Low>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "growthAreas": ["<area1>", "<area2>", "<area3>"],
  "recommendedNextRole": "<specific role title>",
  "summary": "<2-3 sentence personalized summary>"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: scorePrompt }],
    });

    const text = (response.content[0] as { text: string }).text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    let result;
    try {
      result = JSON.parse(text.slice(start, end + 1));
    } catch {
      console.error("Failed to parse Claude response:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        answers,
        result: {
          create: {
            leadershipScore: result.leadershipScore,
            promotionReadiness: result.promotionReadiness,
            strengths: result.strengths,
            growthAreas: result.growthAreas,
            recommendedNextRole: result.recommendedNextRole,
            summary: result.summary,
          },
        },
      },
      include: { result: true },
    });

    return NextResponse.json(assessment);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Assessment error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
