import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  FileText,
  LogOut,
  Share2,
  Eye,
  CreditCard,
  Target,
  Wrench,
  TrendingUp,
  Compass,
  Users,
} from "lucide-react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { QuickJobScanner } from "@/components/dashboard/quick-job-scanner";
import { ResumesTab } from "@/components/dashboard/resumes-tab";
import { JobAnalysesList } from "@/components/dashboard/job-analyses-list";
import { RecruiterLinksList } from "@/components/dashboard/recruiter-links-list";
import { ToolsTab } from "@/components/dashboard/tools-tab";
import { LinkedInJobsRadar } from "@/components/dashboard/linkedin-jobs-radar";
import { LinkedInBenchmarkView } from "@/components/dashboard/linkedin-benchmark-modal";

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

  // 4. Calculate key metrics
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Radial Fade Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-6xl">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-xl text-white">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>CVForge</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/billing">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
              >
                <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Fatura ve Geçiş</span>
              </Button>
            </Link>
            <span className="text-xs text-slate-500 hidden md:inline-block font-mono">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="post">
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="gap-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Oturumu Kapat</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative container mx-auto flex-1 px-4 py-8 sm:px-8 max-w-6xl">
        {/* Trial Status Banner */}
        <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-slate-950 p-5 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">7 Günlük Ücretsiz Deneme Sürümü Aktif</h3>
                <Badge variant="success" className="bg-emerald-950/80 text-emerald-400 border-emerald-800 text-[10px]">
                  PROFESYONEL PLAN
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sınırsız ATS iş optimizasyonuna, LinkedIn profil senkronizasyonuna (Apify) ve canlı işe alım uzmanı paylaşımına sınırsız erişiminiz var.
              </p>
            </div>
          </div>
          <Link href="/billing">
            <Button size="sm" variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/50 text-xs shrink-0">
              Üyeliği Yönet
            </Button>
          </Link>
        </div>

        {/* 21st.dev Metric Cards Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Toplam Özgeçmişler</span>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalResumes}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Aktif İşe Alımcı Bağlantıları</span>
              <Share2 className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalActiveLinks}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Toplam İşe Alımcı Görüntülemeleri</span>
              <Eye className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalViews}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Ortalama ATS Skoru</span>
              <Target className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {avgAtsScore > 0 ? `%${avgAtsScore}` : "—"}
            </div>
          </div>
        </div>

        {/* Quick Action Bento Grid (AI Builder / LinkedIn Apify / PDF / Demo) */}
        <QuickActions hasResumes={totalResumes > 0} />

        {/* Quick ATS Job Scanner Widget */}
        <QuickJobScanner resumes={resumes || []} />

        {/* Candidate Command Center Multi-Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="resumes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="resumes"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate">CV&apos;lerim</span>
                <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 data-[state=active]:bg-indigo-700">
                  {totalResumes}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="jobs-radar"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                <span className="truncate">İlan Radarı</span>
              </TabsTrigger>

              <TabsTrigger
                value="benchmark"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <span className="truncate">Profil Kıyasla</span>
              </TabsTrigger>

              <TabsTrigger
                value="analyses"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <Target className="h-3.5 w-3.5 text-amber-400" />
                <span className="truncate">ATS Analiz</span>
                <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 data-[state=active]:bg-indigo-700">
                  {analyses?.length || 0}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="links"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <Share2 className="h-3.5 w-3.5 text-violet-400" />
                <span className="truncate">İşe Alımcı</span>
                <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 data-[state=active]:bg-indigo-700">
                  {sharedLinks?.length || 0}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="tools"
                className="gap-1.5 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
              >
                <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                <span className="truncate">Araçlar</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Resumes */}
            <TabsContent value="resumes" className="focus:outline-none">
              <ResumesTab resumes={resumes || []} />
            </TabsContent>

            {/* Tab 2: LinkedIn Jobs Radar (curious_coder scraper) */}
            <TabsContent value="jobs-radar" className="focus:outline-none">
              <LinkedInJobsRadar resumes={resumes || []} />
            </TabsContent>

            {/* Tab 3: LinkedIn Profile Benchmark (dev_fusion scraper) */}
            <TabsContent value="benchmark" className="focus:outline-none">
              <LinkedInBenchmarkView />
            </TabsContent>

            {/* Tab 4: Job Analyses */}
            <TabsContent value="analyses" className="focus:outline-none">
              <JobAnalysesList analyses={analyses || []} />
            </TabsContent>

            {/* Tab 5: Recruiter Links */}
            <TabsContent value="links" className="focus:outline-none">
              <RecruiterLinksList
                links={sharedLinks || []}
                resumes={resumes || []}
              />
            </TabsContent>

            {/* Tab 6: Tools & Export */}
            <TabsContent value="tools" className="focus:outline-none">
              <ToolsTab userEmail={user.email || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
