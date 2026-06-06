"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Sparkles } from "lucide-react";

interface Roadmap {
  id: string;
  currentSituation: string;
  threeMonthPlan: string;
  sixMonthPlan: string;
  twelveMonthPlan: string;
  skillsToDevelop: string[];
  networkingStrategy: string;
  promotionStrategy: string;
  successMetrics: string[];
  updatedAt: string;
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setRoadmap(data);
        setFetched(true);
      });
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/roadmap", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Generation failed");
    } else {
      setRoadmap(data);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center animate-pulse">
          <Sparkles className="h-5 w-5 text-[#7C3AED]" />
        </div>
        <p className="text-zinc-600 font-medium">Building your roadmap...</p>
        <p className="text-sm text-zinc-400">Creating your personalized 12-month career plan</p>
      </div>
    );
  }

  if (!roadmap && fetched) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Career Roadmap</h1>
          <p className="text-zinc-500 mt-1">Your personalized 3, 6, and 12-month career plan.</p>
        </div>
        <Card className="text-center p-10">
          <Sparkles className="h-8 w-8 text-[#7C3AED]/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Generate your roadmap</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
            Based on your profile and assessment results, your AI coach will create a personalized
            career roadmap with measurable milestones.
          </p>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <Button onClick={generate}>
            <Sparkles className="h-4 w-4 mr-2" /> Generate my roadmap
          </Button>
        </Card>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Career Roadmap</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Last updated {new Date(roadmap.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generate}>
          <RefreshCw className="h-3 w-3 mr-2" /> Regenerate
        </Button>
      </div>

      {/* Current situation */}
      <Card className="border-[#7C3AED]/20 bg-[#7C3AED]/5">
        <CardContent className="pt-5">
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide mb-2">Current Situation</p>
          <p className="text-zinc-800 text-sm leading-relaxed">{roadmap.currentSituation}</p>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="space-y-4">
        {[
          { label: "3-Month Plan", content: roadmap.threeMonthPlan, badge: "Near term" },
          { label: "6-Month Plan", content: roadmap.sixMonthPlan, badge: "Mid term" },
          { label: "12-Month Plan", content: roadmap.twelveMonthPlan, badge: "Long term" },
        ].map((plan) => (
          <Card key={plan.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{plan.label}</CardTitle>
                <Badge variant="secondary">{plan.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{plan.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skills & Metrics */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Skills to Develop</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roadmap.skillsToDevelop.map((s) => (
                <Badge key={s} variant="default">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Success Metrics</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {roadmap.successMetrics.map((m) => (
                <li key={m} className="text-sm text-zinc-700 flex items-start gap-2">
                  <span className="text-[#7C3AED] mt-0.5 shrink-0">◆</span> {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Strategies */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Networking Strategy</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700 leading-relaxed">{roadmap.networkingStrategy}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Promotion Strategy</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700 leading-relaxed">{roadmap.promotionStrategy}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
