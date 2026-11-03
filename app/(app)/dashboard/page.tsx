import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  FileText,
  Calendar,
  ExternalLink,
  LogOut,
  Target,
  ArrowRight,
  TrendingUp,
  Eye,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { CreateResumeDialog } from "@/components/resume/create-dialog";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*, shared_links(id, slug, is_active, view_count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Calculate stats
  const totalResumes = resumes?.length || 0;
  let totalActiveLinks = 0;
  let totalViews = 0;

  resumes?.forEach((r) => {
    const links = r.shared_links || [];
    totalActiveLinks += links.filter((l: any) => l.is_active).length;
    totalViews += links.reduce((sum: number, l: any) => sum + (l.view_count || 0), 0);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-xl text-white">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>CVForge</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative container mx-auto flex-1 px-4 py-8 sm:px-8 max-w-6xl">
        {/* Trial Status Glass Banner */}
        <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-slate-950 p-5 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">7-Day Free Trial Active</h3>
                <Badge variant="success" className="bg-emerald-950/80 text-emerald-400 border-emerald-800 text-[10px]">
                  PRO PLAN
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You have unrestricted access to unlimited ATS job optimizations, LinkedIn profile syncing, and live recruiter sharing.
              </p>
            </div>
          </div>
        </div>

        {/* 21st.dev Metric Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Total Resumes</span>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalResumes}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Active Recruiter Links</span>
              <Share2 className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalActiveLinks}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Total Recruiter Views</span>
              <Eye className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalViews}</div>
          </div>
        </div>

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Your Resumes</h1>
            <p className="text-xs text-slate-400">
              Manage, edit, optimize, and share your personalized resumes
            </p>
          </div>
          <CreateResumeDialog />
        </div>

        {/* Resumes Grid */}
        {resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const links = resume.shared_links || [];
              const activeLinks = links.filter((l: any) => l.is_active);
              const views = links.reduce((sum: number, l: any) => sum + (l.view_count || 0), 0);

              return (
                <div
                  key={resume.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-indigo-500/5 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {resume.title}
                      </h3>
                      <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 text-[10px] uppercase">
                        {resume.template}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-4">
                      <Calendar className="h-3 w-3" />
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>

                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Source:</span>
                        <span className="font-medium text-slate-200 capitalize">{resume.source}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Active Links:</span>
                        <span className="font-medium text-slate-200">{activeLinks.length}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Recruiter Views:</span>
                        <span className="font-semibold text-emerald-400">{views}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <Link href={`/resumes/${resume.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 hover:bg-slate-800 text-slate-200">
                        Edit Resume
                      </Button>
                    </Link>
                    <Link href={`/resumes/${resume.id}/optimize`}>
                      <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                        <Target className="h-3.5 w-3.5" />
                        Optimize
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No resumes created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Create your first resume by importing your LinkedIn profile or starting from our proven ATS templates.
            </p>
            <CreateResumeDialog buttonText="Create Your First Resume" />
          </div>
        )}
      </main>
    </div>
  );
}
