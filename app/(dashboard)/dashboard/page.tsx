import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Target, MessageCircle, Map, Users, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, latestAssessment, latestRoadmap] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.assessment.findFirst({
      where: { userId },
      include: { result: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.careerRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const steps = [
    {
      title: "Complete your profile",
      desc: "Tell us about your role, experience, and goals",
      href: "/profile",
      icon: User,
      done: !!profile,
    },
    {
      title: "Take the leadership assessment",
      desc: "Discover your strengths and growth areas",
      href: "/assessment",
      icon: Target,
      done: !!latestAssessment?.result,
    },
    {
      title: "Generate your roadmap",
      desc: "Get your personalized 12-month career plan",
      href: "/roadmap",
      icon: Map,
      done: !!latestRoadmap,
    },
    {
      title: "Talk to your AI Coach",
      desc: "Get direct, personalized career guidance",
      href: "/coach",
      icon: MessageCircle,
      done: false,
    },
    {
      title: "Connect with a Mentor",
      desc: "Choose an expert mentor persona for specialized guidance",
      href: "/mentor",
      icon: Users,
      done: false,
    },
  ];

  const nextStep = steps.find((s) => !s.done);
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-zinc-500 mt-1">
          {completedCount === 0
            ? "Let's start your career acceleration journey."
            : `You're ${completedCount} of ${steps.length} steps into your journey.`}
        </p>
      </div>

      {/* Next action */}
      {nextStep && (
        <Card className="border-[#7C3AED]/20 bg-[#7C3AED]/5">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide mb-2">Next step</p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{nextStep.title}</h2>
                <p className="text-sm text-zinc-500 mt-1">{nextStep.desc}</p>
              </div>
              <Link href={nextStep.href}>
                <Button size="sm" className="shrink-0">
                  Start <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment snapshot */}
      {latestAssessment?.result && (
        <Card>
          <CardHeader>
            <CardTitle>Leadership Assessment</CardTitle>
            <CardDescription>Your latest results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-[#7C3AED]">
                {latestAssessment.result.leadershipScore}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900">Leadership Score</div>
                <Badge variant={
                  latestAssessment.result.promotionReadiness === "High" ? "success" :
                  latestAssessment.result.promotionReadiness === "Medium" ? "warning" : "secondary"
                }>
                  {latestAssessment.result.promotionReadiness} promotion readiness
                </Badge>
              </div>
            </div>
            <p className="text-sm text-zinc-600">{latestAssessment.result.summary}</p>
            <Link href="/assessment">
              <Button variant="link" className="px-0 mt-2 text-sm">View full results →</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Steps grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Your journey</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.href} href={step.href}>
                <div className={`p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer hover:border-[#7C3AED]/30 ${
                  step.done ? "bg-white border-zinc-100" : "bg-white border-zinc-100 hover:bg-zinc-50"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    step.done ? "bg-emerald-50" : "bg-zinc-100"
                  }`}>
                    {step.done
                      ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                      : <Icon className="h-4 w-4 text-zinc-400" />
                    }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{step.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
