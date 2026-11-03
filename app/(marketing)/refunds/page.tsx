import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Refund Policy</h1>
        <p className="text-xs text-slate-400">Last updated: November 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">7-Day Free Trial</h2>
          <p>
            All subscriptions include an initial 7-day free trial. You may cancel at any moment during these 7 days with zero charge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">14-Day Money-Back Guarantee</h2>
          <p>
            If your trial converts to an annual subscription and you are not completely satisfied, we offer a hassle-free full refund within 14 days of your first payment date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">How to Request a Refund</h2>
          <p>
            Simply email our support team with your account email address. Refunds are processed back to your original payment method within 5-10 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
