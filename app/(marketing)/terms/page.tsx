import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: November 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CVForge, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">2. Free Trial & Subscriptions</h2>
          <p>
            We offer a 7-day free trial on our Annual Pro plan. You can cancel anytime before the trial ends and you will not be charged. After 7 days, your subscription will renew automatically at $99/year until canceled.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">3. Shareable CV Links</h2>
          <p>
            Public shared links remain active and viewable by recruiters while you maintain active subscription access. If your access lapses, links will display an unavailable notice without deleting your underlying data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">4. User Content & AI Usage</h2>
          <p>
            You retain all ownership of your resume content. Our AI provides suggestions and scoring based on job postings. We do not fabricate work experience and encourage users to verify all suggested revisions before submission.
          </p>
        </section>
      </div>
    </div>
  );
}
