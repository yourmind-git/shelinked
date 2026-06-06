"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

const QUESTIONS = [
  { id: "vision", category: "Vision & Strategy", text: "I can clearly articulate a compelling vision and strategy for my team or area of work." },
  { id: "influence", category: "Influence", text: "I effectively influence others without direct authority to achieve results." },
  { id: "communication", category: "Communication", text: "I communicate complex ideas clearly and adapt my style for different audiences." },
  { id: "decision", category: "Decision Making", text: "I make sound decisions under uncertainty and am comfortable with ambiguity." },
  { id: "team", category: "Team Development", text: "I actively develop and mentor others, investing in their growth." },
  { id: "accountability", category: "Accountability", text: "I hold myself and others accountable for results and follow through on commitments." },
  { id: "change", category: "Change Leadership", text: "I effectively lead through change and help others adapt to new directions." },
  { id: "conflict", category: "Conflict Resolution", text: "I address conflict directly and constructively, turning tension into progress." },
  { id: "executive", category: "Executive Presence", text: "I project confidence, credibility, and gravitas in high-stakes situations." },
  { id: "stakeholder", category: "Stakeholder Management", text: "I build strong relationships with senior stakeholders and manage up effectively." },
];

const LABELS = ["Rarely", "Sometimes", "Often", "Usually", "Always"];

export default function AssessmentPage() {
  const [step, setStep] = useState<"intro" | "questions" | "loading" | "results" | "error">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{
    leadershipScore: number;
    promotionReadiness: string;
    strengths: string[];
    growthAreas: string[];
    recommendedNextRole: string;
    summary: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/assessment").then((r) => r.json()).then((data) => {
      if (data?.result) {
        setResult(data.result);
        setStep("results");
      }
    });
  }, []);

  async function submit() {
    setStep("loading");
    setSubmitError("");
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok || !data.result) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setStep("error");
        return;
      }
      setResult(data.result);
      setStep("results");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Network error. Please try again.");
      setStep("error");
    }
  }

  function selectAnswer(value: number) {
    const q = QUESTIONS[current];
    setAnswers({ ...answers, [q.id]: value });
    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300);
    }
  }

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leadership Assessment</h1>
          <p className="text-zinc-500 mt-1">Discover your leadership strengths and growth areas.</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-zinc-700">
              This 10-question assessment evaluates your leadership across key dimensions: vision, influence,
              communication, decision-making, and more.
            </p>
            <p className="text-zinc-700">
              You&apos;ll receive a personalized score, promotion readiness rating, your top strengths, and
              specific growth areas.
            </p>
            <p className="text-sm text-zinc-500">Takes about 5 minutes. Answer honestly — this is for your benefit.</p>
            <Button onClick={() => setStep("questions")} className="mt-2">
              Start assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center animate-pulse">
          <RefreshCw className="h-5 w-5 text-[#7C3AED] animate-spin" />
        </div>
        <p className="text-zinc-600 font-medium">Analyzing your responses...</p>
        <p className="text-sm text-zinc-400">Generating your personalized leadership profile</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <p className="text-zinc-800 font-medium">Something went wrong</p>
        <p className="text-sm text-red-500 max-w-sm">{submitError}</p>
        <Button onClick={() => setStep("questions")}>
          Go back and try again
        </Button>
      </div>
    );
  }

  if (step === "results" && result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Your Leadership Profile</h1>
          <p className="text-zinc-500 mt-1">Based on your assessment responses</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="sm:col-span-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-5xl font-bold text-[#7C3AED] mb-1">{result.leadershipScore}</div>
            <div className="text-sm text-zinc-500">Leadership Score</div>
            <div className="mt-2">
              <Progress value={result.leadershipScore} className="w-24" />
            </div>
          </Card>
          <Card className="sm:col-span-2">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-700">Promotion Readiness</span>
                <Badge variant={
                  result.promotionReadiness === "High" ? "success" :
                  result.promotionReadiness === "Medium" ? "warning" : "secondary"
                }>
                  {result.promotionReadiness}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-700">Recommended Next Role</span>
                <p className="text-sm text-zinc-600 mt-0.5">{result.recommendedNextRole}</p>
              </div>
              <p className="text-sm text-zinc-600">{result.summary}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-emerald-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.growthAreas.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-[#7C3AED] mt-0.5">→</span> {g}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" onClick={() => { setStep("intro"); setAnswers({}); setCurrent(0); }} size="sm">
          <RefreshCw className="h-3 w-3 mr-2" /> Retake assessment
        </Button>
      </div>
    );
  }

  // Questions
  const q = QUESTIONS[current];
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-500">Question {current + 1} of {QUESTIONS.length}</span>
          <span className="text-sm text-zinc-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide mb-3">{q.category}</p>
          <p className="text-lg font-medium text-zinc-900 mb-8">{q.text}</p>

          <div className="grid grid-cols-5 gap-2">
            {LABELS.map((label, i) => {
              const value = i + 1;
              const selected = answers[q.id] === value;
              return (
                <button
                  key={label}
                  onClick={() => selectAnswer(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selected
                      ? "border-[#7C3AED] bg-[#7C3AED]/10"
                      : "border-zinc-100 hover:border-[#7C3AED]/30 hover:bg-zinc-50"
                  }`}
                >
                  <span className={`text-lg font-bold ${selected ? "text-[#7C3AED]" : "text-zinc-400"}`}>{value}</span>
                  <span className={`text-xs text-center ${selected ? "text-[#7C3AED]" : "text-zinc-400"}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {allAnswered && (
          <Button onClick={submit}>
            Submit <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
