"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Building2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { OptimizationResult } from "@/lib/ai/optimizer";

export function QuickJobScanner({ resumes }: { resumes: any[] }) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes?.[0]?.id || ""
  );
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleScan = async () => {
    if (!selectedResumeId) {
      toast.error("Lütfen önce analiz edilecek bir özgeçmiş seçin veya örnek CV yükleyin.");
      return;
    }

    if (inputType === "url" && (!jobUrl || !jobUrl.includes("linkedin.com"))) {
      toast.error("Lütfen geçerli bir LinkedIn iş ilanı bağlantısı girin.");
      return;
    }

    if (inputType === "text" && (!jobDescription || jobDescription.trim().length < 20)) {
      toast.error("Lütfen en az 20 karakterlik bir iş tanımı metni yapıştırın.");
      return;
    }

    setLoading(true);
    setResult(null);
    toast.info("Claude 3.5 Haiku & Apify iş ilanını analiz ediyor...");

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobUrl: inputType === "url" ? jobUrl : undefined,
          jobDescription: inputType === "text" ? jobDescription : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İlan analizi başarısız oldu");

      setResult(data);
      toast.success(`Analiz tamamlandı! ATS Skoru: %${data.score}`);
    } catch (err: any) {
      toast.error(err.message || "İlan taranırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/40";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-950/40";
    return "text-rose-400 border-rose-500/30 bg-rose-950/40";
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-950 p-5 sm:p-6 mb-8 backdrop-blur-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-white text-base">Hızlı ATS İlan Tarayıcısı</h3>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 text-[10px]">
              Claude 3.5 Haiku
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hedef iş ilanını yapıştırın; yapay zeka anahtar kelime boşluklarını ve ATS uyum puanınızı saniyeler içinde çıkarsın.
          </p>
        </div>

        {/* Input Type Switcher */}
        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputType("url")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              inputType === "url"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            LinkedIn İlan URL
          </button>
          <button
            type="button"
            onClick={() => setInputType("text")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              inputType === "text"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            İlan Metni Yapıştır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Resume Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Karşılaştırılacak CV</Label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            disabled={loading || !resumes?.length}
            className="w-full h-10 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {resumes?.length ? (
              resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.template})
                </option>
              ))
            ) : (
              <option value="">Özgeçmiş bulunamadı (Önce örnek CV yükleyin)</option>
            )}
          </select>
        </div>

        {/* Job Input */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs text-slate-300">
            {inputType === "url" ? "LinkedIn İlan Bağlantısı" : "İş Tanımı Metni"}
          </Label>
          {inputType === "url" ? (
            <div className="flex gap-2">
              <Input
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={loading}
                className="bg-slate-950 border-slate-800 text-white text-xs h-10"
              />
              <Button
                onClick={handleScan}
                disabled={loading || !selectedResumeId || !jobUrl}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shrink-0 h-10 text-xs px-4"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? "Taranıyor..." : "ATS Skorunu Tara"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="İş tanımını buraya yapıştırın (görevler, aranan teknolojiler, gereksinimler)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                className="bg-slate-950 border-slate-800 text-white text-xs h-20"
              />
              <Button
                onClick={handleScan}
                disabled={loading || !selectedResumeId || !jobDescription}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-9 text-xs px-4 w-full sm:w-auto"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? "Analiz Ediliyor..." : "Metni Analiz Et"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Result Display Box */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in-50 duration-300">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-14 w-14 rounded-xl border flex flex-col items-center justify-center font-bold ${getScoreColor(
                    result.score
                  )}`}
                >
                  <span className="text-xl leading-none">%{result.score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">ATS Skoru</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                    {result.company ? `${result.company} — ` : ""}
                    {result.jobTitle || "Hedef Pozisyon"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{result.summary}</p>
                </div>
              </div>

              <Link href={`/resumes/${selectedResumeId}/optimize`}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md">
                  Tam Optimizasyon Sayfası <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Keyword Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-900">
              <div>
                <span className="text-emerald-400 font-medium flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Eşleşen Anahtar Kelimeler ({result.keywords.matched.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.matched.slice(0, 8).map((kw, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-emerald-500/20 bg-emerald-950/40 text-emerald-300 text-[10px]"
                    >
                      {kw}
                    </Badge>
                  ))}
                  {result.keywords.matched.length > 8 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{result.keywords.matched.length - 8} daha
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-rose-400 font-medium flex items-center gap-1 mb-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Eksik Kritik Kelimeler ({result.keywords.missing.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.missing.slice(0, 8).map((kw, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-rose-500/20 bg-rose-950/40 text-rose-300 text-[10px]"
                    >
                      {kw}
                    </Badge>
                  ))}
                  {result.keywords.missing.length > 8 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{result.keywords.missing.length - 8} daha
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
