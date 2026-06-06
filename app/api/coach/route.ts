import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { buildCoachPrompt } from "@/prompts/system";
import { Message } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conv = await prisma.coachConversation.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conv);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, conversationId } = await req.json() as { messages: Message[]; conversationId?: string };

  const [profile, assessmentResult] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.assessmentResult.findFirst({
      where: { assessment: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const systemPrompt = buildCoachPrompt(profile, assessmentResult);

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const assistantMessage = (response.content[0] as { text: string }).text;
  const updatedMessages = [...messages, { role: "assistant" as const, content: assistantMessage }];

  if (conversationId) {
    await prisma.coachConversation.update({
      where: { id: conversationId },
      data: { messages: updatedMessages },
    });
  } else {
    await prisma.coachConversation.create({
      data: { userId: session.user.id, messages: updatedMessages },
    });
  }

  return NextResponse.json({ message: assistantMessage });
}
