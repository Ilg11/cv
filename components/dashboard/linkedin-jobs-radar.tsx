"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Search,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Target,
  Wand2,
  Loader2,
  Briefcase,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { LinkedInJobSearchResult } from "@/lib/server/apify/linkedin-job";

export function LinkedInJobsRadar({ resumes }: { resumes: any[] }) {
  const router = useRouter();
  const [keywords, setKeywords] = useState("Full Stack Developer");
  const [location, setLocation] = useState("Remote");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<LinkedInJobSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [creatingForJobId, setCreatingForJobId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keywords || keywords.trim().length < 2) {
      toast.error("Lütfen aranacak bir pozisyon veya konu girin.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    toast.info("Apify (curious_coder/linkedin-jobs-scraper) LinkedIn'den ilanları tarıyor...");

    try {
      const res = await fetch("/api/scrape/jobs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.trim(), location: location.trim(), limit: 8 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İlanlar taranamadı");

      setJobs(data.jobs || []);
      toast.success(`${data.count || 0} adet LinkedIn iş ilanı bulundu!`);
    } catch (err: any) {
      toast.error(err.message || "İlan arama sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCvForJob = async (job: LinkedInJobSearchResult) => {
    setCreatingForJobId(job.id);
    toast.info(`"${job.title}" pozisyonu için özel ATS CV hazırlanıyor...`);

    try {
      const res = await fetch("/api/ai/generate-starter-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: job.title,
          experienceLevel: "mid",
          skills: [keywords],
          customNote: `Targeting role at ${job.companyName}. Job Description highlights: ${job.descriptionText?.slice(0, 300) || ""}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CV oluşturulamadı");

      toast.success(`"${data.title}" oluşturuldu! Düzenleyici açılıyor...`);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "CV oluşturulamadı");
    } finally {
      setCreatingForJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/70 to-slate-950 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">LinkedIn Canlı İlan Radarı & Keşif</h3>
            <p className="text-xs text-slate-400">
              Apify scraper&apos;ı kullanarak LinkedIn&apos;deki canlı iş ilanlarını tarayın; tek tıkla ATS uyumunu ölçün veya o ilana özel CV oluşturun.
            </p>
          </div>
        </div>

        {/* Search Inputs Bar */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Konu / Pozisyon (örn: React Developer, AI Engineer)..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={loading}
              className="bg-slate-950 border-slate-800 text-white text-xs h-10"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              placeholder="Konum (örn: Remote, Turkey, Worldwide)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              className="bg-slate-950 border-slate-800 text-white text-xs h-10"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || !keywords}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-10 text-xs shadow-md shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Taranıyor..." : "İlanları Tara (Apify)"}
            </Button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-500">Popüler Aramalar:</span>
          {[
            "Full Stack Developer",
            "Frontend Engineer",
            "DevOps Engineer",
            "Product Manager",
            "Data Analyst",
            "Python AI Engineer",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setKeywords(tag);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid / List */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isGenerating = creatingForJobId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        {job.companyName}
                      </p>
                    </div>

                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="h-9 w-9 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs">
                        {job.companyName?.slice(0, 2).toUpperCase() || "JOB"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {job.location}
                    </span>
                    {job.seniorityLevel && (
                      <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px] py-0">
                        {job.seniorityLevel}
                      </Badge>
                    )}
                    {job.postedAt && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.postedAt}
                      </span>
                    )}
                  </div>

                  {job.descriptionText && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                      {job.descriptionText}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCreateCvForJob(job)}
                    disabled={isGenerating}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5" />
                    )}
                    {isGenerating ? "Hazırlanıyor..." : "Bu İlana Özel CV Yap"}
                  </Button>

                  {job.link && (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="LinkedIn'de ilanı aç"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : hasSearched && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white text-base">Bu arama kriterinde ilan bulunamadı</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Lütfen farklı bir pozisyon adı veya &quot;Remote&quot; konumu deneyin.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white text-base">LinkedIn İlanlarını Canlı Keşfedin</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Yukarıdaki arama kutusuna ilgilendiğiniz rolü yazarak (örn: &quot;Frontend Developer&quot;, &quot;DevOps&quot;, &quot;AI Engineer&quot;) Apify ile LinkedIn&apos;deki en güncel iş ilanlarını listeleyin.
          </p>
          <Button
            size="sm"
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
          >
            <Search className="h-3.5 w-3.5" /> Örnek İlanları Getir
          </Button>
        </div>
      )}
    </div>
  );
}
