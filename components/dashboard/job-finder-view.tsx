"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  Target,
  Wand2,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LinkedInJobSearchResult } from "@/lib/server/apify/linkedin-job";

interface JobFinderViewProps {
  initialResumes: Array<{ id: string; title: string }>;
}

export function JobFinderView({ initialResumes }: JobFinderViewProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState("b2b saas");
  const [location, setLocation] = useState("Remote");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<LinkedInJobSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [creatingForJobId, setCreatingForJobId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keywords || keywords.trim().length < 2) {
      toast.error("Lütfen aranacak bir pozisyon veya anahtar kelime girin.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    toast.info("Apify ile LinkedIn'den canlı iş ilanları taranıyor...");

    try {
      const res = await fetch("/api/scrape/jobs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.trim(),
          location: location.trim(),
          limit: 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İlanlar taranamadı");

      setJobs(data.jobs || []);
      if (data.jobs && data.jobs.length > 0) {
        toast.success(`${data.jobs.length} adet LinkedIn iş ilanı listelendi!`);
      } else {
        toast.info("Bu arama kriterine uygun ilan bulunamadı. Lütfen anahtar kelimeleri değiştirin.");
      }
    } catch (err: any) {
      toast.error(err.message || "İlan arama sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click AI Starter CV tailored for this specific job posting
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
          skills: [keywords, "B2B SaaS", "Strategy"],
          customNote: `Target role: ${job.title} at ${job.companyName}. Highlights: ${job.descriptionText?.slice(0, 300) || ""}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CV oluşturulamadı");

      toast.success(`"${data.title}" oluşturuldu! Düzenleyiciye yönlendiriliyorsunuz...`);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "CV oluşturulamadı");
    } finally {
      setCreatingForJobId(null);
    }
  };

  // Navigate to ATS Optimizer with job text preloaded
  const handleOptimizeForJob = (job: LinkedInJobSearchResult) => {
    if (initialResumes.length === 0) {
      toast.error("Önce en az bir özgeçmiş oluşturmalısınız.");
      router.push("/dashboard/cvs");
      return;
    }
    // Store job details in sessionStorage for instant auto-fill in optimize page
    try {
      sessionStorage.setItem(
        "optimize_job_payload",
        JSON.stringify({
          title: job.title,
          company: job.companyName,
          description: job.descriptionText || `${job.title} at ${job.companyName}`,
          jobUrl: job.link,
        })
      );
    } catch (e) {
      console.error(e);
    }
    // If user has a resume, take them directly to the resume's optimizer
    const firstResumeId = initialResumes[0].id;
    router.push(`/resumes/${firstResumeId}/optimize`);
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Job Finder
          </h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Search for jobs on LinkedIn and instantly optimize your CV for them.
        </p>
      </div>

      {/* Search Bar Container matching screenshot */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="b2b saas, software engineer, product manager..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Location Input */}
          <div className="relative sm:w-64">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote, Worldwide, City..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aranıyor...</span>
              </>
            ) : (
              <span>Search Jobs</span>
            )}
          </Button>
        </form>
      </div>

      {/* Suggested Quick Searches */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Popüler Aramalar:</span>
        {[
          { k: "B2B SaaS", l: "Remote" },
          { k: "Full Stack Developer", l: "Remote" },
          { k: "Product Manager", l: "Remote" },
          { k: "Data Scientist", l: "Remote" },
          { k: "AI Engineer", l: "Remote" },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setKeywords(item.k);
              setLocation(item.l);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
          >
            {item.k}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="inline-flex h-12 w-12 rounded-full bg-slate-100 items-center justify-center text-slate-700 mb-4 animate-spin">
              <Loader2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">
              LinkedIn İlanları Taranıyor...
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Apify Curious Coder scraper LinkedIn üzerinde &quot;{keywords}&quot; ({location}) araması yapıyor. Bu işlem birkaç saniye sürebilir.
            </p>
          </div>
        )}

        {!loading && hasSearched && jobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900">İlan Bulunamadı</h3>
            <p className="text-slate-500 text-sm mt-1">
              &quot;{keywords}&quot; için sonuç alınamadı. Anahtar kelimeleri basitleştirip tekrar deneyebilirsiniz.
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600 px-1">
              <span>
                Bulunan İlanlar: <strong className="text-slate-900">{jobs.length}</strong>
              </span>
              <span className="text-xs text-slate-400">
                LinkedIn canlı verileri • Apify Entegrasyonu
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Company Logo or Fallback */}
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                        {job.companyLogo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-800">
                            {job.companyName}
                          </span>
                          {job.location && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                            </>
                          )}
                          {job.postedAt && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Calendar className="h-3 w-3" />
                                {job.postedAt}
                              </span>
                            </>
                          )}
                          {job.seniorityLevel && (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {job.seniorityLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* External Link */}
                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 self-start shrink-0 underline-offset-4 hover:underline"
                      >
                        <span>LinkedIn&apos;de İncele</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Description snippet */}
                  {job.descriptionText && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {job.descriptionText}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleOptimizeForJob(job)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 rounded-lg shadow-xs"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>CV&apos;mi Bu İlana Göre Optimize Et</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateCvForJob(job)}
                      disabled={creatingForJobId === job.id}
                      className="text-xs gap-1.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      {creatingForJobId === job.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>AI CV Yazıyor...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Bu İlan İçin Özel ATS CV Üret</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initial Welcome Card */}
        {!hasSearched && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">
                Hedef Pozisyonunuzu Arayın
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                LinkedIn&apos;deki en güncel ilanları tarayarak özgeçmişinizi ATS uyumlu hale getirin veya tek tıkla ilana özel yapay zeka destekli CV oluşturun.
              </p>
            </div>
            <Button
              onClick={() => handleSearch()}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm px-6"
            >
              Hemen İlanları Listele
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
