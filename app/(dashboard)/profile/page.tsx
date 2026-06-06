"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Upload, Sparkles, FileText, X } from "lucide-react";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Consulting", "Education",
  "Retail", "Manufacturing", "Media", "Government", "Non-profit", "Other"
];

const LEADERSHIP_EXP = [
  "None yet — I want to grow into leadership",
  "Informal — I lead projects or initiatives",
  "1–2 years managing a small team",
  "3–5 years managing teams",
  "5+ years leading teams or departments",
  "Executive leadership experience",
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvSuccess, setCvSuccess] = useState(false);
  const [form, setForm] = useState({
    currentRole: "",
    industry: "",
    yearsExperience: "",
    leadershipExp: "",
    careerGoals: "",
    desiredRole: "",
    language: "English",
  });

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      if (data?.currentRole) {
        setForm({
          currentRole: data.currentRole,
          industry: data.industry,
          yearsExperience: String(data.yearsExperience),
          leadershipExp: data.leadershipExp,
          careerGoals: data.careerGoals,
          desiredRole: data.desiredRole,
          language: data.language || "English",
        });
      }
    });
  }, []);

  async function handleCvUpload(file: File) {
    setCvFile(file);
    setCvLoading(true);
    setCvError("");
    setCvSuccess(false);

    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch("/api/profile/parse-cv", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: Record<string, any> = {};
    try {
      data = await res.json();
    } catch {
      setCvLoading(false);
      setCvError("Server error — check the terminal for details");
      return;
    }
    setCvLoading(false);

    if (!res.ok) {
      setCvError((data.error as string) || "Failed to read CV");
      return;
    }

    setForm({
      currentRole: data.currentRole || "",
      industry: INDUSTRIES.includes(data.industry) ? data.industry : "",
      yearsExperience: data.yearsExperience ? String(data.yearsExperience) : "",
      leadershipExp: LEADERSHIP_EXP.includes(data.leadershipExp) ? data.leadershipExp : "",
      desiredRole: data.desiredRole || "",
      careerGoals: data.careerGoals || "",
    });
    setCvSuccess(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleCvUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") handleCvUpload(file);
    else setCvError("Only PDF files are supported");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, yearsExperience: Number(form.yearsExperience) }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Something went wrong");
    } else {
      setSaved(true);
      setTimeout(() => router.push("/assessment"), 1200);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Career Profile</h1>
        <p className="text-zinc-500 mt-1">This powers all your AI coaching and mentoring experiences.</p>
      </div>

      {/* CV Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
            Import from CV
          </CardTitle>
          <CardDescription>Upload your CV and we'll fill in your profile automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {!cvFile && !cvLoading ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#7C3AED]/40 hover:bg-zinc-50 transition-colors"
            >
              <Upload className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-600">Drop your CV here or click to upload</p>
              <p className="text-xs text-zinc-400 mt-1">PDF only · Max 10MB</p>
            </div>
          ) : cvLoading ? (
            <div className="border-2 border-dashed border-[#7C3AED]/30 rounded-xl p-8 text-center bg-[#7C3AED]/5">
              <Sparkles className="h-6 w-6 text-[#7C3AED] mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium text-[#7C3AED]">Reading your CV...</p>
              <p className="text-xs text-zinc-400 mt-1">Extracting your career details</p>
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${cvSuccess ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <FileText className={`h-5 w-5 shrink-0 ${cvSuccess ? "text-emerald-600" : "text-red-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">{cvFile?.name}</p>
                {cvSuccess && <p className="text-xs text-emerald-600 mt-0.5">Profile auto-filled — review and save below</p>}
                {cvError && <p className="text-xs text-red-500 mt-0.5">{cvError}</p>}
              </div>
              <button
                onClick={() => { setCvFile(null); setCvSuccess(false); setCvError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-zinc-400 hover:text-zinc-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Career Details</CardTitle>
          <CardDescription>
            {cvSuccess ? "Imported from your CV — review and edit as needed." : "Be specific — the more context you give, the more personalized your coaching."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Current role</Label>
                <Input
                  placeholder="e.g. Senior Product Manager"
                  value={form.currentRole}
                  onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Years of experience</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 7"
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Leadership experience</Label>
                <Select value={form.leadershipExp} onValueChange={(v) => setForm({ ...form, leadershipExp: v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {LEADERSHIP_EXP.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Desired role</Label>
              <Input
                placeholder="e.g. VP of Product, Engineering Manager, Startup Founder"
                value={form.desiredRole}
                onChange={(e) => setForm({ ...form, desiredRole: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Career goals</Label>
              <Textarea
                placeholder="What are you trying to achieve in your career? Be specific — e.g. 'I want to move into a Director of Product role within 18 months and eventually build my own startup'"
                className="h-28"
                value={form.careerGoals}
                onChange={(e) => setForm({ ...form, careerGoals: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Coaching language</Label>
              <div className="flex gap-3">
                {(["English", "Swedish"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setForm({ ...form, language: lang })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.language === lang
                        ? "border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED]"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <span>{lang === "English" ? "🇬🇧" : "🇸🇪"}</span>
                    {lang === "Swedish" ? "Svenska" : "English"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">All AI coaching, mentoring, and roadmap responses will be in this language.</p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading || saved} className="w-full sm:w-auto">
              {saved ? (
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Saved!</span>
              ) : loading ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
