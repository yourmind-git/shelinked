import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("cv") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            } as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"][0],
            {
              type: "text",
              text: `Extract career information from this CV/resume. Return ONLY a JSON object with these exact fields, nothing else:

{
  "currentRole": "<most recent job title>",
  "industry": "<one of exactly: Technology, Finance, Healthcare, Consulting, Education, Retail, Manufacturing, Media, Government, Non-profit, Other>",
  "yearsExperience": <total years of professional experience as integer>,
  "leadershipExp": "<one of exactly: None yet — I want to grow into leadership, Informal — I lead projects or initiatives, 1–2 years managing a small team, 3–5 years managing teams, 5+ years leading teams or departments, Executive leadership experience>",
  "desiredRole": "<inferred next career step based on trajectory and any stated goals>",
  "careerGoals": "<2-3 sentence summary of career goals inferred from the CV>"
}`,
            },
          ],
        },
      ],
    });

    const text = (response.content[0] as { type: string; text: string }).text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Could not extract data from CV. Please fill in manually." }, { status: 422 });
    }

    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("parse-cv error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
