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
      if (!res.ok) throw new Error(data.error || "Optimizasyon başarısız oldu");

      setResult(data);
      toast.success(`ATS Eşleşme Skoru: %${data.score}`);
    } catch (err: any) {
      toast.error(err.message || "İlan taranırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Hızlı ATS İlan Tarayıcısı
            </h3>
            <p className="text-[11px] text-slate-500">
              LinkedIn linki veya metin yapıştırın; anlık uyum puanını ve eksik kelimeleri görün.
            </p>
          </div>
        </div>

        {/* Input Type Pill Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputType("url")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              inputType === "url"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            LinkedIn İlan URL
          </button>
          <button
            type="button"
            onClick={() => setInputType("text")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              inputType === "text"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            İlan Metni Yapıştır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Resume Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600 font-medium">Karşılaştırılacak CV</Label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            disabled={loading || !resumes?.length}
            className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
          <Label className="text-xs text-slate-600 font-medium">
            {inputType === "url" ? "LinkedIn İlan Bağlantısı" : "İş Tanımı Metni"}
          </Label>
          {inputType === "url" ? (
            <div className="flex gap-2">
              <Input
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={loading}
                className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl flex-1"
              />
              <Button
                onClick={handleScan}
                disabled={loading || !selectedResumeId || !jobUrl}
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shrink-0 h-10 text-xs px-5 rounded-xl shadow-xs"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "Taranıyor..." : "ATS Skorunu Tara"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="İş tanımını buraya yapıştırın (görevler, aranan teknolojiler, gereksinimler)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                className="bg-white border-slate-200 text-slate-900 text-xs h-20 rounded-xl resize-none"
              />
              <Button
                onClick={handleScan}
                disabled={loading || !selectedResumeId || !jobDescription}
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-9 text-xs px-5 rounded-xl"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "Analiz Ediliyor..." : "Metni Analiz Et"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Result Display Box */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in-50 duration-300">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-14 w-14 rounded-xl border flex flex-col items-center justify-center font-bold ${getScoreColor(
                    result.score
                  )}`}
                >
                  <span className="text-xl leading-none">%{result.score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">ATS Skoru</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    {result.jobTitle || "Hedef Pozisyon"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{result.summary}</p>
                </div>
              </div>

              <Link href={`/resumes/${selectedResumeId}/optimize`}>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 rounded-xl shadow-xs">
                  <span>Tam Optimizasyon Sayfası</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Keyword Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
              <div>
                <span className="text-emerald-700 font-medium flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Eşleşen Anahtar Kelimeler (
                  {result.keywords?.matched?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.keywords?.matched?.slice(0, 6).map((k: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-[10px]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-rose-700 font-medium flex items-center gap-1 mb-1.5">
                  <AlertCircle className="h-3 w-3" /> Eksik Kritik Kelimeler ({result.keywords?.missing?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.keywords?.missing?.slice(0, 6).map((k: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800 text-[10px]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
