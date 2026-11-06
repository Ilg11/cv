"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Linkedin,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Wand2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileBenchmarkResult } from "@/lib/server/apify/linkedin-profile";

export function LinkedInBenchmarkView() {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [benchmark, setBenchmark] = useState<ProfileBenchmarkResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [permissionUrl, setPermissionUrl] = useState<string | null>(null);

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileUrl.includes("linkedin.com/in/")) {
      toast.error("Lütfen geçerli bir LinkedIn profil bağlantısı girin (örn: https://linkedin.com/in/kullanici-adi)");
      return;
    }

    setLoading(true);
    setBenchmark(null);
    setPermissionUrl(null);
    toast.info("Apify (dev_fusion/linkedin-profile-scraper) profili inceliyor...");

    try {
      const res = await fetch("/api/scrape/profile-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl: profileUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes("approvePermissions")) {
          setPermissionUrl("https://console.apify.com/actors/2SyF0bVxmgGr8IVCZ?approvePermissions=true");
        }
        throw new Error(data.error || "Profil incelenemedi");
      }

      setBenchmark(data.benchmark);
      toast.success("Profil başarıyla çekildi ve incelendi!");
    } catch (err: any) {
      toast.error(err.message || "Profil taranırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCvFromProfile = async () => {
    if (!benchmark) return;
    setCreating(true);
    toast.info("İncelenen profil verileri ATS CV şablonunuza aktarılıyor...");

    try {
      const res = await fetch("/api/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: benchmark.rawUrl,
          title: `${benchmark.headline || benchmark.fullName} (Referans CV)`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CV oluşturulamadı");

      toast.success("Özgeçmişiniz oluşturuldu! Düzenleyiciye aktarılıyorsunuz...");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "CV oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Box */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-slate-900/70 to-slate-950 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Linkedin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">LinkedIn Profil & Kariyer Araştırma</h3>
            <p className="text-xs text-slate-400">
              Kendi profilinizi veya hedeflediğiniz pozisyondaki başarılı bir profesyonelin LinkedIn profilini Apify ile inceleyin; kullanılan dili, anahtar kelimeleri ve deneyim maddelerini referans alarak ATS CV oluşturun.
            </p>
          </div>
        </div>

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3 mt-4">
          <Input
            placeholder="https://www.linkedin.com/in/kullanici-adi"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            disabled={loading}
            className="bg-slate-950 border-slate-800 text-white text-xs h-10 flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !profileUrl}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 h-10 text-xs px-5 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Taranıyor..." : "Profili İncele (Apify)"}
          </Button>
        </form>

        {/* Permission Required Alert */}
        {permissionUrl && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Apify İzin Onayı Gerekiyor</span>
                <span>Bu scraper&apos;ı çalıştırmak için Apify hesabınızda tek seferlik onay vermelisiniz.</span>
              </div>
            </div>
            <a
              href={permissionUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 transition-colors"
            >
              İzni Onayla (1-Tık) <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Benchmark Results Display */}
      {benchmark ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-5 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">{benchmark.fullName}</h4>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                  LinkedIn Profili
                </Badge>
              </div>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">{benchmark.headline}</p>
            </div>

            <Button
              onClick={handleCreateCvFromProfile}
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs shadow-md"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {creating ? "CV'ye Dönüştürülüyor..." : "Bu Profili Referans Alarak CV Oluştur"}
            </Button>
          </div>

          {/* Summary */}
          {benchmark.summary && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Profesyonel Özet</span>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                {benchmark.summary}
              </p>
            </div>
          )}

          {/* Experience Highlights */}
          {benchmark.experienceHighlights.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" /> Kariyer Geçmişi & Başarı Maddeleri
              </span>
              <div className="space-y-2.5">
                {benchmark.experienceHighlights.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-white">{exp.title}</span>
                      <span className="text-slate-500 text-[11px]">{exp.duration}</span>
                    </div>
                    <span className="text-indigo-300 text-[11px] block mb-2">{exp.company}</span>
                    <ul className="space-y-1 text-slate-300">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">&bull;</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {benchmark.skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Tespit Edilen Yetenekler & Teknolojiler</span>
              <div className="flex flex-wrap gap-1.5">
                {benchmark.skills.map((sk, i) => (
                  <Badge key={i} variant="outline" className="border-blue-500/20 bg-blue-950/30 text-blue-300 text-xs py-1">
                    {sk}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white text-base">LinkedIn Profilini Kıyaslayın & Referans Alın</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Herhangi bir LinkedIn profil bağlantısını yukarıdaki kutuya girerek sektörünüzdeki başarılı profesyonellerin profil yapısını inceleyin ve tek tıkla kendi ATS formatında CV&apos;nize dönüştürün.
          </p>
        </div>
      )}
    </div>
  );
}
