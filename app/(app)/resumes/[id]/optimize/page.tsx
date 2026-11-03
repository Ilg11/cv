"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Target,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Copy,
  Loader2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { OptimizationResult } from "@/lib/ai/optimizer";

export default function OptimizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadResume() {
      const res = await fetch(`/api/resumes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setResume(data);
      }
    }
    loadResume();
  }, [params.id]);

  const handleFetchJob = async () => {
    if (!jobUrl || !jobUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn job URL first.");
      return;
    }

    setFetchingJob(true);
    toast.info("Apify is scraping job details from LinkedIn...");

    try {
      const res = await fetch("/api/scrape/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch job details");

      setJobDescription(data.description);
      toast.success(`Scraped: ${data.jobTitle} at ${data.company}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch LinkedIn job.");
    } finally {
      setFetchingJob(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error("Please paste the job description (at least 20 characters).");
      return;
    }

    setLoading(true);
    setResult(null);
    toast.info("Claude 3.5 is analyzing the job description and scoring your resume...");

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: params.id,
          jobDescription,
          jobUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");

      setResult(data);
      const defaults: Record<string, boolean> = {};
      data.suggestions.forEach((sug: any) => {
        defaults[sug.id] = true;
      });
      setAcceptedSuggestions(defaults);
      toast.success("Analysis complete! Review the suggestions below.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setAcceptedSuggestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApplyChanges = async () => {
    if (!result || !resume) return;

    setLoading(true);
    try {
      const updatedContent = JSON.parse(JSON.stringify(resume.content));

      result.suggestions.forEach((sug) => {
        if (!acceptedSuggestions[sug.id]) return;

        if (sug.section === "experience" && updatedContent.experience) {
          updatedContent.experience.forEach((exp: any) => {
            if (sug.targetId && exp.id === sug.targetId) {
              const idx = exp.bullets.findIndex((b: string) => b.trim() === sug.before.trim());
              if (idx !== -1) {
                exp.bullets[idx] = sug.after;
              } else {
                exp.bullets.push(sug.after);
              }
            }
          });
        }
      });

      const title = `${resume.title} - Tailored for ${result.company || result.jobTitle}`;
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          template: resume.template,
          source: resume.source,
          content: updatedContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tailored copy");

      toast.success("New tailored resume created!");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href={`/resumes/${params.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Editor</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <span className="font-semibold text-slate-200 text-sm hidden sm:inline">
              ATS Optimizer: {resume?.title || "Resume"}
            </span>
          </div>
          <Badge variant="outline" className="gap-1.5 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs">
            <Sparkles className="h-3 w-3" />
            Claude 3.5 AI Engine
          </Badge>
        </div>
      </header>

      <main className="relative container mx-auto flex-1 px-4 py-8 sm:px-8 max-w-5xl">
        {/* Step 1: Input Job Description */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Target Job Description
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Paste the job posting you want to apply for. Our AI analyzes the requirements, scores your resume, and provides targeted revisions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="job-url" className="text-xs text-slate-400">
                LinkedIn Job Posting URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="job-url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  disabled={loading || fetchingJob}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchJob}
                  disabled={loading || fetchingJob || !jobUrl}
                  className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 gap-1.5 shrink-0 text-xs h-9 px-3"
                >
                  {fetchingJob ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  {fetchingJob ? "Scraping..." : "Fetch with Apify"}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job-desc" className="text-xs font-semibold text-slate-300">
                Job Description Text *
              </Label>
              <Textarea
                id="job-desc"
                rows={6}
                placeholder="Paste the full job description, qualifications, and requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                className="bg-slate-950 border-slate-800 text-slate-200 font-mono text-xs placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="gap-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Match & Keywords...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze & Calculate ATS Score
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2: Results Display */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Score Banner (21st.dev Style) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Circular Gauge */}
              <div className="md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  ATS Match Score
                </span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke={result.score >= 75 ? "#10b981" : result.score >= 50 ? "#f59e0b" : "#f43f5e"}
                      strokeWidth="10"
                      strokeDasharray={339}
                      strokeDashoffset={339 * (1 - result.score / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white">{result.score}</span>
                    <span className={`text-[10px] font-bold ${
                      result.score >= 75 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {result.score >= 75 ? "HIGH MATCH" : result.score >= 50 ? "MODERATE" : "NEEDS WORK"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 mt-3">Calculated against ATS parsing rubrics</span>
              </div>

              {/* Assessment Card */}
              <div className="md:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between backdrop-blur-xl">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">
                    {result.jobTitle} at {result.company}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">{result.summary}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800 pt-4 text-center">
                  <div className="rounded-lg bg-slate-950/60 p-2.5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Keywords</span>
                    <span className="font-bold text-white text-base">{result.scoreBreakdown.keywordsMatch}%</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Relevance</span>
                    <span className="font-bold text-white text-base">{result.scoreBreakdown.titleRelevance}%</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Impact</span>
                    <span className="font-bold text-white text-base">{result.scoreBreakdown.impactAndMetrics}%</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Structure</span>
                    <span className="font-bold text-white text-base">{result.scoreBreakdown.structureAndClarity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Analysis Chips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="font-bold text-white text-base">Key ATS Target Terms</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block mb-2">
                    ✓ Found in your resume ({result.keywords.matched.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.matched.map((kw, i) => (
                      <Badge key={i} className="bg-emerald-950/80 text-emerald-300 border-emerald-800/80 text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-amber-400 block mb-2">
                    ⚠ Missing from your resume ({result.keywords.missing.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.map((kw, i) => (
                      <Badge key={i} className="bg-amber-950/80 text-amber-300 border-amber-800/80 text-xs">
                        + {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Rewrites */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Recommended ATS Revisions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review each bullet suggestion. Accepted bullets will be woven into a tailored duplicate version of your resume.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {result.suggestions.map((sug) => {
                  const isAccepted = acceptedSuggestions[sug.id] !== false;
                  return (
                    <div
                      key={sug.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isAccepted
                          ? "border-indigo-500/40 bg-indigo-950/20 shadow-md shadow-indigo-950/10"
                          : "border-slate-800 bg-slate-950/40 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px] uppercase">
                          {sug.section}
                        </Badge>
                        <Button
                          variant={isAccepted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSuggestion(sug.id)}
                          className={`h-7 text-xs gap-1.5 ${
                            isAccepted
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "border-slate-700 text-slate-400"
                          }`}
                        >
                          {isAccepted ? (
                            <>
                              <Check className="h-3 w-3" />
                              Accepted
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Rejected
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-slate-300">
                          <span className="text-[11px] font-bold text-rose-400 block mb-0.5">Original:</span>
                          <span className="line-through text-slate-400">{sug.before}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-slate-100">
                          <span className="text-[11px] font-bold text-emerald-400 block mb-0.5">ATS Optimized:</span>
                          <span className="font-medium text-emerald-200">{sug.after}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2.5 italic">
                        💡 {sug.reason}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
                <span className="text-xs text-slate-500">
                  A duplicate resume will be created. Your existing resume is never overwritten.
                </span>
                <Button
                  onClick={handleApplyChanges}
                  disabled={loading}
                  className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Save as Tailored Resume Version
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
