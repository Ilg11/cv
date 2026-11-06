"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function JobAnalysesList({ analyses }: { analyses: any[] }) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
          <Target className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-white text-base">Henüz ATS İş Analizi Yapılmadı</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Yukarıdaki Hızlı ATS İlan Tarayıcısına veya bir CV&apos;nin &quot;Optimize Et&quot; butonuna tıklayarak hedef iş ilanınızı analiz edin.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/50";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-950/50";
    return "text-rose-400 border-rose-500/30 bg-rose-950/50";
  };

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => {
        const missing = Array.isArray(analysis.missing_keywords)
          ? analysis.missing_keywords
          : [];

        return (
          <div
            key={analysis.id}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-md group"
          >
            <div className="flex items-start gap-4">
              {/* ATS Score Dial */}
              <div
                className={`h-12 w-12 rounded-xl border flex flex-col items-center justify-center font-bold shrink-0 ${getScoreColor(
                  analysis.ats_score || 0
                )}`}
              >
                <span className="text-base leading-none">%{analysis.ats_score || 0}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">ATS</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                    {analysis.job_title || "Pozisyon Belirtilmemiş"}
                  </h4>
                  {analysis.job_company && (
                    <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                      <Building2 className="h-3 w-3 mr-1 text-slate-400" />
                      {analysis.job_company}
                    </Badge>
                  )}
                  {analysis.resumes?.title && (
                    <span className="text-[11px] text-slate-500">
                      &bull; CV: {analysis.resumes.title}
                    </span>
                  )}
                </div>

                {/* Missing Keywords Tags */}
                {missing.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-rose-400" /> Eksik:
                    </span>
                    {missing.slice(0, 5).map((kw: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-rose-500/20 bg-rose-950/30 text-rose-300 text-[9px] py-0 px-1.5"
                      >
                        {kw}
                      </Badge>
                    ))}
                    {missing.length > 5 && (
                      <span className="text-[10px] text-slate-500">+{missing.length - 5} daha</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(analysis.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  {analysis.job_url && (
                    <a
                      href={analysis.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> İlan Bağlantısı
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <Link
                href={`/resumes/${analysis.resume_id}/optimize`}
                className="w-full md:w-auto"
              >
                <Button
                  size="sm"
                  className="w-full md:w-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Raporu & İyileştirmeleri Gör
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
