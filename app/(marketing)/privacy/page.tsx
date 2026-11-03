import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: November 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">1. Information We Collect</h2>
          <p>
            We collect the information you provide directly, including your email address and resume data (work history, skills, contact information).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">2. How We Use Your Data</h2>
          <p>
            Your information is strictly used to provide resume building, ATS match scoring, and link sharing capabilities. Your personal resume data is never sold to third parties or recruiters.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">3. Third-Party Service Providers</h2>
          <p>
            We utilize trusted industry partners for infrastructure: Supabase (encrypted database & authentication), Anthropic Claude (AI ATS processing), and Apify (public profile scraping upon explicit request).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">4. Data Deletion & Export</h2>
          <p>
            You have full ownership of your data. You may export your resume content at any time or request complete account deletion through your dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
