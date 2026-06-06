import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { buildRoadmapPrompt } from "@/prompts/system";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await prisma.careerRoadmap.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(roadmap);
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [profile, assessmentResult] = await Promise.all([
      prisma.careerProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.assessmentResult.findFirst({
        where: { assessment: { userId: session.user.id } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Complete your career profile first" }, { status: 400 });
    }

    const prompt = buildRoadmapPrompt(profile, assessmentResult);

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end < start) {
      console.error("Incomplete JSON in response:", text.slice(-200));
      return NextResponse.json({ error: "AI returned an unexpected format. Please try again." }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(text.slice(start, end + 1));
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr, "\nRaw:", text);
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    // Upsert: update existing roadmap or create new one
    const existing = await prisma.careerRoadmap.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const roadmapData = {
      currentSituation: data.currentSituation ?? "",
      threeMonthPlan: data.threeMonthPlan ?? "",
      sixMonthPlan: data.sixMonthPlan ?? "",
      twelveMonthPlan: data.twelveMonthPlan ?? "",
      skillsToDevelop: Array.isArray(data.skillsToDevelop) ? data.skillsToDevelop : [],
      networkingStrategy: data.networkingStrategy ?? "",
      promotionStrategy: data.promotionStrategy ?? "",
      successMetrics: Array.isArray(data.successMetrics) ? data.successMetrics : [],
    };

    let roadmap;
    if (existing) {
      roadmap = await prisma.careerRoadmap.update({
        where: { id: existing.id },
        data: roadmapData,
      });
    } else {
      roadmap = await prisma.careerRoadmap.create({
        data: { userId: session.user.id, ...roadmapData },
      });
    }

    return NextResponse.json(roadmap);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Roadmap error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
