"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { OptimizationResult } from "@/lib/ai/optimizer";

interface OptimizeHubViewProps {
  resumes: Array<{ id: string; title: string; template: string }>;
}

export function OptimizeHubView({ resumes }: OptimizeHubViewProps) {
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState(
    resumes[0]?.id || ""
  );
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fetchingJob, setFetchingJob] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleFetchLinkedInJob = async () => {
    if (!jobUrl || !jobUrl.includes("linkedin.com")) {
      toast.error("Lütfen geçerli bir LinkedIn iş ilanı URL'si girin.");
      return;
    }

    setFetchingJob(true);
    toast.info("Apify ile LinkedIn ilan detayları çekiliyor...");

    try {
      const res = await fetch("/api/scrape/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İlan çekilemedi");

      setJobDescription(data.description || "");
      toast.success(`LinkedIn ilanı çekildi: ${data.jobTitle} (${data.company})`);
    } catch (err: any) {
      toast.error(err.message || "İlan çekilirken hata oluştu.");
    } finally {
      setFetchingJob(false);
    }
  };

  const handleRunOptimization = async () => {
    if (!selectedResumeId) {
      toast.error("Lütfen optimize edilecek bir özgeçmiş seçin.");
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 40) {
      toast.error("Lütfen en az 40 karakterlik bir iş tanımı girin veya LinkedIn linki ile çekin.");
      return;
    }

    setOptimizing(true);
    setResult(null);
    toast.info("Claude 3.5 Haiku ile ATS eşleşmesi hesaplanıyor...");

    try {
      // 1. Fetch current resume content
      const resumeRes = await fetch(`/api/resumes/${selectedResumeId}`);
      if (!resumeRes.ok) throw new Error("Özgeçmiş verisi yüklenemedi");
      const resumeData = await resumeRes.json();

      // 2. Run optimization
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          resumeContent: resumeData.content,
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analiz yapılamadı");

      setResult(data);
      toast.success(`ATS Analizi tamamlandı! Skor: ${data.score}/100`);
    } catch (err: any) {
      toast.error(err.message || "Optimizasyon sırasında hata oluştu.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Target className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            ATS Optimizer
          </h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Match your CV against any job posting to find missing keywords, check your 0-100 score, and generate ATS-proof bullet points.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">
            Önce Bir Özgeçmiş Oluşturmalısınız
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            ATS optimizasyonu yapabilmek için sistemde en az 1 adet CV bulunmalıdır.
          </p>
          <Link href="/dashboard/cvs">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs mt-2">
              Özgeçmiş Oluşturmaya Git
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Setup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="font-semibold text-slate-900 text-base">
                1. Özgeçmişinizi Seçin
              </h2>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Hedef CV
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.template})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h2 className="font-semibold text-slate-900 text-base mb-3">
                  2. Hedef İlanı Belirleyin
                </h2>

                {/* LinkedIn Auto Scrape Input */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>LinkedIn İlan Linki (Opsiyonel)</span>
                    <span className="text-[10px] text-slate-400">Apify Scraper</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/jobs/view/..."
                      className="text-xs h-10 rounded-xl bg-white border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchLinkedInJob}
                      disabled={fetchingJob}
                      className="h-10 text-xs px-3 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 rounded-xl"
                    >
                      {fetchingJob ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Çek"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Raw Job Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    İş Tanımı Metni
                  </label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Hedef pozisyonun iş tanımını, aranan nitelikleri buraya yapıştırın..."
                    rows={8}
                    className="text-xs leading-relaxed rounded-xl bg-white border-slate-200 resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleRunOptimization}
                disabled={optimizing}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all shadow-xs gap-2"
              >
                {optimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>ATS Eşleşmesi Hesaplanıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>ATS Analizini Başlat</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {optimizing && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 text-lg">
                  CV ile İlan Karşılaştırılıyor
                </h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  Claude 3.5 Haiku, iş tanımındaki anahtar kelimeleri ve teknik gereksinimleri çıkarıyor...
                </p>
              </div>
            )}

            {!optimizing && !result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3 shadow-xs">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">
                  Henüz Bir Analiz Yapılmadı
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Soldaki formdan bir özgeçmiş seçip iş tanımını yapıştırarak ilk ATS analizini başlatabilirsiniz.
                </p>
              </div>
            )}

            {!optimizing && result && (
              <div className="space-y-6">
                {/* Score Summary Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        ATS Uyum Skoru
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                        {result.score >= 75
                          ? "Mükemmel Uyum! 🎯"
                          : result.score >= 50
                          ? "Geliştirilebilir Durumda"
                          : "Kritik Eksikler Var"}
                      </h3>
                    </div>
                    <div
                      className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-bold text-xl shadow-xs ${
                        result.score >= 75
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : result.score >= 50
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span>{result.score}</span>
                      <span className="text-[10px] font-normal text-slate-400">/100</span>
                    </div>
                  </div>

                  {result.summary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      {result.summary}
                    </p>
                  )}
                </div>

                {/* Keyword Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Missing Keywords */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs uppercase tracking-wider">
                      <AlertCircle className="h-4 w-4" />
                      <span>Eksik Anahtar Kelimeler ({result.keywords?.missing?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords?.missing?.map((k, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800 text-xs font-medium"
                        >
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Eşleşen Kelimeler ({result.keywords?.matched?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords?.matched?.map((k, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-xs font-medium"
                        >
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Google XYZ Formülü ile İyileştirme Önerileri
                    </h4>
                    <div className="space-y-3">
                      {result.suggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs"
                        >
                          <div className="text-slate-500 line-through">
                            {sug.before}
                          </div>
                          <div className="text-slate-900 font-medium text-emerald-800">
                            → {sug.after}
                          </div>
                          {sug.reason && (
                            <p className="text-[11px] text-slate-500 italic">
                              Sebep: {sug.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Link href={`/resumes/${selectedResumeId}/optimize`}>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs gap-1.5 mt-2">
                        <span>Tam Düzenleyici İle İyileştirmeleri Uygula</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
