"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Download,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error("Failed to delete account");

      toast.success("Account and data permanently deleted.");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60">
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <span className="font-semibold text-slate-200 text-sm">
              Billing & Account Management
            </span>
          </div>
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs">
            Annual Pro Pass
          </Badge>
        </div>
      </header>

      <main className="relative container mx-auto flex-1 px-4 py-8 sm:px-8 max-w-4xl space-y-8">
        {/* Plan Overview Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Current Plan
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">CVForge Annual Pro</h2>
              <p className="text-xs text-slate-400 mt-1">
                Unlimited AI ATS optimizations, unlimited ATS templates, and live recruiter link hosting.
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-3xl font-extrabold text-white">$99</span>
              <span className="text-xs text-slate-400"> / year</span>
              <div className="mt-1">
                <Badge className="bg-emerald-950/80 text-emerald-400 border-emerald-800 text-[10px]">
                  7-DAY FREE TRIAL ACTIVE
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
              <span className="text-slate-500 block">Subscription Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Active Access
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
              <span className="text-slate-500 block">Trial Period</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-400" /> 7 Days Free • Cancel Anytime
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Honesty Policy:</strong> You will not be charged if you cancel before your trial ends. If you continue with the annual pass, you are protected by our 14-day money-back satisfaction guarantee.
            </p>
          </div>
        </div>

        {/* Data Ownership & Export */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-1">Data Ownership & Portability</h3>
          <p className="text-xs text-slate-400 mb-6">
            You own 100% of your career data. Even if your subscription ends, you can always export all your resumes, ATS analyses, and profile records in standard JSON.
          </p>
          <a href="/api/export/json" download>
            <Button variant="outline" className="gap-2 border-slate-700 bg-slate-950 hover:bg-slate-800 text-white">
              <Download className="h-4 w-4 text-indigo-400" />
              Download Full Data Export (JSON)
            </Button>
          </a>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="rounded-2xl border border-rose-900/30 bg-rose-950/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <h3 className="text-lg font-bold text-rose-400 mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-400 mb-6">
            Permanently delete your CVForge account, all stored resumes, shared web links, and ATS analyses. This action cannot be undone.
          </p>

          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs">
                <Trash2 className="h-4 w-4" />
                Delete My Account & All Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Are you absolutely sure?
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs pt-2">
                  This will permanently delete your account, your CVs, and disable all active recruiter web links immediately.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="border-slate-800 text-slate-300">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="gap-1.5 bg-rose-600 hover:bg-rose-500">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
