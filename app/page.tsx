import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  FileText,
  Share2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Eye,
  Check,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* 21st.dev Background Grid Pattern with Radial Fade */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Gradient Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/25 to-pink-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[45rem] -left-40 w-[500px] h-[500px] bg-indigo-700/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Modern Glass Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              CVForge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 font-medium">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-4 text-center sm:px-8 max-w-5xl">
          {/* Shimmering Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-inner shadow-indigo-500/20 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>AI ATS Optimizer 2.0 • Powered by Claude 3.5</span>
            <ArrowRight className="h-3 w-3 text-indigo-400 ml-0.5" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-white leading-[1.1]">
            Turn job postings into{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              interviews in seconds.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            75% of resumes are discarded by Applicant Tracking Systems before a human recruiter even sees them.
            CVForge analyzes your target job, reveals the exact missing keywords, and tailors your resume for maximum match score.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/25 rounded-xl gap-2 group">
                Start 7-Day Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl backdrop-blur-md">
                View Interactive Demo
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> 7-day full access trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Cancel anytime with 1 click
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> No software download
            </span>
          </div>

          {/* Hero Live Mockup Showcase (21st.dev Glass Card) */}
          <div className="mt-16 sm:mt-20 relative mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10">
            {/* Top Mockup Bar */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800/70 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  cvforge.com/resumes/senior-fullstack/optimize
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full text-[10px]">
                <Zap className="h-3 w-3" /> Live ATS Analysis
              </span>
            </div>

            {/* Inner Interactive Mockup Screen */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 text-left">
              {/* Left Column: ATS Score Circle */}
              <div className="md:col-span-4 rounded-xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Match Compatibility
                </span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={289}
                      strokeDashoffset={289 * (1 - 0.92)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white">92</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">HIGH MATCH</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Target: <strong className="text-slate-200">Staff Software Engineer</strong>
                </p>
              </div>

              {/* Right Column: AI Suggestion Preview */}
              <div className="md:col-span-8 rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> AI Tailored Bullet Revision
                  </span>
                  <Badge variant="success" className="text-[10px] bg-emerald-950 text-emerald-300 border-emerald-800">
                    +3 Keywords Added
                  </Badge>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-xs space-y-1">
                  <span className="text-rose-400/90 font-medium block">Original Resume Bullet:</span>
                  <p className="text-slate-400 line-through">
                    Built web microservices and improved API latency for our core platform.
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs space-y-1">
                  <span className="text-emerald-400 font-medium block">AI Optimized Revision (Matches Job Posting):</span>
                  <p className="text-slate-200 font-medium">
                    Architected high-throughput <span className="text-emerald-400 underline decoration-emerald-500/50">Next.js & TypeScript microservices</span> on AWS, reducing p99 API latency by 42% for 2M+ daily requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-950/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-6">
            Trusted by candidates who landed offers at industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 grayscale hover:grayscale-0 transition-all text-slate-300 font-bold text-lg sm:text-xl">
            <span>GOOGLE</span>
            <span>STRIPE</span>
            <span>AMAZON</span>
            <span>META</span>
            <span>VERCEL</span>
            <span>MICROSOFT</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features (21st.dev Style) */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mb-3">
              Precision Engineering
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered to beat every modern ATS scanner
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              From LinkedIn synchronization to verified machine-readable PDFs, every piece is tuned for maximum recruiter callbacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Keyword Gap Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-6">
                Paste any job URL or job description. Our AI performs an instant lexical and semantic audit, highlighting exactly which skills you already demonstrate and which ones to weave in.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {["System Architecture", "TypeScript", "PostgreSQL", "CI/CD", "Redis", "Distributed Systems"].map((k, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                    ✓ {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1-Click LinkedIn Import</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                No tedious copy-pasting. Paste your public LinkedIn URL and our extractor structures your complete work history into an editable draft in 20 seconds.
              </p>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>linkedin.com/in/you</span>
                <span className="text-emerald-400 text-[11px]">Synced ✓</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3 ATS-Proof Templates</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Classic, Modern, and Compact. Every template strictly avoids parsing blockers like complex multi-columns, images of text, or unreadable tables.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                  <Share2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Personal Recruiter Web Links</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  Generate personal, trackable web links (<code className="text-indigo-300">cvforge.com/cv/your-name</code>) to send recruiters on LinkedIn or email. Monitor when recruiters open and read your resume in real time.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-800 pt-4">
                <span>✓ View Count Analytics</span>
                <span>✓ Custom Company Tagging</span>
                <span>✓ Instant Deactivate Toggle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix (21st.dev Style) */}
      <section id="pricing" className="py-24 border-t border-slate-800/80 bg-slate-950/80 relative">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 mb-3">
            Honest & Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            One Plan. Full Career Advantage.
          </h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto text-base">
            Try everything for 7 days free. No surprises, no hidden fees, cancel anytime in one click.
          </p>

          <div className="mt-14 max-w-md mx-auto">
            <div className="relative rounded-3xl border-2 border-indigo-500/80 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-2xl shadow-indigo-500/20 text-left">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                Annual Pro Pass
              </div>

              <div className="text-center pt-2 pb-6 border-b border-slate-800">
                <span className="text-xs uppercase font-semibold text-indigo-400 tracking-wider">
                  Full Access Membership
                </span>
                <div className="mt-4 flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-white">$99</span>
                  <span className="text-slate-400 font-medium">/ year</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Includes <strong>7-Day Free Trial</strong>. Then $99/year. Cancel before Day 7 and pay nothing.
                </p>
              </div>

              <div className="py-6 space-y-3.5 text-sm">
                {[
                  "Unlimited AI ATS Job Optimizations",
                  "LinkedIn 1-Click Profile Importer",
                  "ATS-Safe Machine-Readable PDF Exports",
                  "Live Personal Shareable CV Links",
                  "Real-Time Keyword Gap Breakdown",
                  "3 Proven ATS Templates (Classic, Modern, Compact)",
                  "Automatic Autosave & Cloud Storage",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-slate-300 text-xs sm:text-sm">{feat}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 rounded-xl">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <p className="text-center text-[11px] text-slate-500 mt-3">
                14-day money-back guarantee after trial • Instant activation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-300">CVForge</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/refunds" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
