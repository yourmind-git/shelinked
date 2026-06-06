import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { buildMentorPrompt } from "@/prompts/system";
import { Message } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const persona = req.nextUrl.searchParams.get("persona");
  if (!persona) return NextResponse.json(null);

  const conv = await prisma.mentorConversation.findFirst({
    where: { userId: session.user.id, persona },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conv);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, persona, conversationId } = await req.json() as {
    messages: Message[];
    persona: string;
    conversationId?: string;
  };

  const profile = await prisma.careerProfile.findUnique({ where: { userId: session.user.id } });
  const systemPrompt = buildMentorPrompt(persona, profile);

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const assistantMessage = (response.content[0] as { text: string }).text;
  const updatedMessages = [...messages, { role: "assistant" as const, content: assistantMessage }];

  if (conversationId) {
    await prisma.mentorConversation.update({
      where: { id: conversationId },
      data: { messages: updatedMessages },
    });
  } else {
    await prisma.mentorConversation.create({
      data: { userId: session.user.id, persona, messages: updatedMessages },
    });
  }

  return NextResponse.json({ message: assistantMessage });
}
