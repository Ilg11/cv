import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  Share2,
  Eye,
  Target,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Compass,
} from "lucide-react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { QuickJobScanner } from "@/components/dashboard/quick-job-scanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user's resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*, shared_links(id, slug, is_active, view_count, company_name)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // 2. Fetch user's job analyses
  const { data: analyses } = await supabase
    .from("job_analyses")
    .select("*, resumes(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Fetch user's shared links
  const { data: sharedLinks } = await supabase
    .from("shared_links")
    .select("*, resumes(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Key metrics
  const totalResumes = resumes?.length || 0;
  const totalActiveLinks = sharedLinks?.filter((l: any) => l.is_active).length || 0;
  const totalViews = sharedLinks?.reduce((sum: number, l: any) => sum + (l.view_count || 0), 0) || 0;

  let avgAtsScore = 0;
  if (analyses && analyses.length > 0) {
    const scores = analyses.filter((a) => typeof a.ats_score === "number").map((a) => a.ats_score);
    if (scores.length > 0) {
      avgAtsScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Aday Kontrol Merkezi
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Özgeçmişlerinizi yönetin, LinkedIn ilanlarını tarayın ve ATS uyum skorunuzu artırın.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/jobs">
            <Button
              variant="outline"
              className="text-xs h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-600" />
              <span>İlan Bul</span>
            </Button>
          </Link>

          <Link href="/dashboard/cvs">
            <Button className="text-xs h-10 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Yeni Özgeçmiş</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Resumes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Özgeçmişler
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalResumes}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Kayıtlı ATS CV</p>
          </div>
        </div>

        {/* Active Recruiter Links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Aktif Linkler
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Share2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalActiveLinks}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">İşe alımcı linki</p>
          </div>
        </div>

        {/* Recruiter Views */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Görüntülenme
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{totalViews}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Toplam inceleme</p>
          </div>
        </div>

        {/* ATS Avg Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ortalama ATS
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {avgAtsScore > 0 ? `${avgAtsScore}%` : "—"}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Uyum puanı</p>
          </div>
        </div>
      </div>

      {/* Quick Action Bento Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Hızlı Başlatıcı & İçe Aktarma
        </h2>
        <QuickActions resumes={resumes || []} />
      </div>

      {/* Quick ATS Job Scanner */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Anlık ATS İlan Tarayıcısı
        </h2>
        <QuickJobScanner resumes={resumes || []} />
      </div>

      {/* Recent CVs & Recent Analyses Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Son Özgeçmişler</h3>
            <Link
              href="/dashboard/cvs"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!resumes || resumes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Henüz kayıtlı özgeçmiş bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumes.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/resumes/${r.id}`}
                      className="font-medium text-sm text-slate-900 hover:text-indigo-600 truncate block"
                    >
                      {r.title}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.updated_at).toLocaleDateString("tr-TR")} • Şablon: {r.template}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/resumes/${r.id}/optimize`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 gap-1"
                      >
                        <Target className="h-3 w-3 text-indigo-600" />
                        <span>ATS</span>
                      </Button>
                    </Link>
                    <Link href={`/resumes/${r.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Düzenle
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent ATS Analyses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Son ATS Analizleri</h3>
            <Link
              href="/dashboard/optimize"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Yeni Analiz</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!analyses || analyses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Henüz kaydedilmiş bir ATS analizi yok.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analyses.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {a.job_title || "Hedef Pozisyon"}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      CV: {a.resumes?.title || "Özgeçmiş"} •{" "}
                      {new Date(a.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        (a.ats_score || 0) >= 75
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : (a.ats_score || 0) >= 50
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {a.ats_score || 0}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
