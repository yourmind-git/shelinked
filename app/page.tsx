import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-zinc-900 text-lg">SheLinked</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-4 py-1.5 text-sm text-[#7C3AED] font-medium mb-8">
          AI-powered career acceleration
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
          Your world-class career coach,{" "}
          <span className="text-[#7C3AED]">available 24/7</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10">
          SheLinked helps women accelerate their careers and become stronger leaders, product managers,
          executives, consultants, and entrepreneurs through personalized AI coaching and mentoring.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Start your journey <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-12">
            Everything you need to accelerate your career
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Leadership Assessment",
                desc: "Understand your leadership strengths, gaps, and promotion readiness with a personalized analysis.",
              },
              {
                title: "AI Career Coach",
                desc: "A direct, strategic coach that identifies obstacles and creates accountability for your goals.",
              },
              {
                title: "Career Roadmap",
                desc: "Get a personalized 3, 6, and 12-month plan with measurable milestones toward your goals.",
              },
              {
                title: "AI Mentor",
                desc: "Choose from expert personas: Executive Leader, Product Leader, Startup Founder, or Agile Coach.",
              },
              {
                title: "Career Profile",
                desc: "Build a comprehensive profile that powers all your AI coaching and mentoring experiences.",
              },
              {
                title: "Goal Tracking",
                desc: "Track your progress and stay accountable to the actions that move your career forward.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-zinc-100">
                <CheckCircle className="h-5 w-5 text-[#7C3AED] mb-3" />
                <h3 className="font-semibold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">Ready to accelerate your career?</h2>
        <p className="text-zinc-500 mb-8">Join SheLinked and get your personalized career roadmap today.</p>
        <Link href="/register">
          <Button size="lg">Get started for free <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        © 2024 SheLinked. All rights reserved.
      </footer>
    </div>
  );
}
