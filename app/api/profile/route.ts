import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  currentRole: z.string().min(1),
  industry: z.string().min(1),
  yearsExperience: z.number().min(0).max(50),
  leadershipExp: z.string().min(1),
  careerGoals: z.string().min(1),
  desiredRole: z.string().min(1),
  language: z.enum(["English", "Swedish"]).default("English"),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.careerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const profile = await prisma.careerProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...body },
      update: body,
    });
    return NextResponse.json(profile);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
