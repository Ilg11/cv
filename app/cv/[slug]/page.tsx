import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { hasActiveAccess } from "@/lib/access";
import { ResumeRenderer } from "@/components/resume/templates";
import { ResumeContent } from "@/lib/resume/schema";
import { Sparkles, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: link } = await supabase
    .from("shared_links")
    .select("resumes(title, content)")
    .eq("slug", params.slug)
    .single();

  const resume: any = link?.resumes;
  const fullName = resume?.content?.basics?.fullName || "Candidate";

  return {
    title: `${fullName} - Professional Resume`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicCvPage({ params }: PageProps) {
  const supabase = createAdminClient();

  // 1. Fetch link with resume and owner profile
  const { data: link, error } = await supabase
    .from("shared_links")
    .select("*, resumes(*), profiles(*)")
    .eq("slug", params.slug)
    .single();

  if (error || !link || !link.resumes) {
    notFound();
  }

  // 2. Check if link is toggled active
  if (!link.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h1 className="text-xl font-bold text-slate-800">Resume Link Inactive</h1>
          <p className="text-sm text-slate-500">
            This resume link has been temporarily disabled by its owner.
          </p>
        </div>
      </div>
    );
  }

  // 3. Check access (Single source of truth)
  const isAccessActive = hasActiveAccess(link.profiles);

  if (!isAccessActive) {
    // Neutral paywall for recruiters / visitors (Part B3 requirement)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Resume Currently Unavailable</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            This resume is currently unavailable. The owner may have paused or ended their live sharing access.
          </p>
        </div>
      </div>
    );
  }

  // 4. Increment view count (fire & forget in background)
  supabase
    .from("shared_links")
    .update({ view_count: (link.view_count || 0) + 1 })
    .eq("id", link.id)
    .then(() => {});

  const resume = link.resumes;
  const content = resume.content as ResumeContent;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Discreet Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm print:hidden">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Verified Candidate Profile</span>
            {link.company_name && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500">
                Tailored for {link.company_name}
              </span>
            )}
          </div>
          <button
            onClick={() => {}}
            className="text-xs text-primary font-medium hover:underline print:hidden"
          >
            ATS-Readable Format
          </button>
        </div>
      </header>

      {/* Main Resume Presentation */}
      <main className="flex-1 container mx-auto py-8 px-4 flex justify-center print:p-0">
        <div className="w-full max-w-[800px] bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <ResumeRenderer template={resume.template} content={content} />
        </div>
      </main>

      {/* Discreet Footer */}
      <footer className="py-6 border-t bg-white text-center text-xs text-slate-400 print:hidden">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Built with CVForge</span>
        </Link>
      </footer>
    </div>
  );
}
