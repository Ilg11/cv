"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Linkedin,
  Upload,
  Plus,
  Loader2,
  FileText,
  Zap,
  CheckCircle2,
  ArrowRight,
  Wand2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { GuidedBuilderDialog } from "@/components/dashboard/guided-builder-dialog";

export function QuickActions({
  resumes,
  onCreated,
}: {
  resumes?: any[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<"demo" | "linkedin" | "pdf" | "scratch" | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("Kıdemli Yazılım Mühendisi");
  const [template, setTemplate] = useState<"classic" | "modern" | "compact">("modern");
  const [permissionUrl, setPermissionUrl] = useState<string | null>(null);

  // 1-Click Demo Resume
  const handleLoadDemo = async () => {
    setLoading(true);
    toast.info("Örnek ATS CV ve analiz verileri hazırlanıyor...");
    try {
      const res = await fetch("/api/resumes/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Örnek CV yüklenemedi");
      toast.success("Örnek CV, Stripe ATS analizi ve işe alımcı linki yüklendi!");
      router.refresh();
      if (onCreated) onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LinkedIn Import via Apify dev_fusion/linkedin-profile-scraper
  const handleLinkedinImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com/in/")) {
      toast.error("Lütfen geçerli bir LinkedIn profil linki girin (linkedin.com/in/...)");
      return;
    }

    setLoading(true);
    setPermissionUrl(null);
    toast.info("Apify dev_fusion scraper LinkedIn profilinizi tarıyor...");

    try {
      const res = await fetch("/api/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: linkedinUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.permissionUrl) {
          setPermissionUrl(data.permissionUrl);
          toast.error("Apify actor izni gerekiyor. Lütfen aşağıdaki butona tıklayın.");
          return;
        }
        throw new Error(data.error || "LinkedIn profili içe aktarılamadı");
      }

      toast.success(`LinkedIn'den aktarıldı: ${data.title}! Düzenleyiciye gidiliyor...`);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "İçe aktarma hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // PDF Resume Upload
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Lütfen bir PDF dosyası seçin");
      return;
    }

    setLoading(true);
    toast.info("PDF yükleniyor ve Claude AI ile ayrıştırılıyor...");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await fetch("/api/import/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PDF ayrıştırılamadı");

      toast.success(`PDF içe aktarıldı: ${data.title}!`);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "PDF içe aktarma hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Scratch CV Create
  const handleCreateScratch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          template,
          content: {
            basics: {
              name: "",
              label: title,
              email: "",
              phone: "",
              location: "",
              website: "",
              summary: "",
            },
            work: [],
            education: [],
            skills: [],
            projects: [],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Özgeçmiş oluşturulamadı");

      toast.success("Boş özgeçmiş oluşturuldu!");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: 1-Click Guided AI Creator */}
        <div className="rounded-2xl border border-indigo-200 bg-white p-5 flex flex-col justify-between group relative overflow-hidden shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all">
          <div className="absolute top-3 right-3">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] uppercase font-semibold">
              Yapay Zeka
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
              <Wand2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
              Sıfırdan Kolay CV Yap
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pozisyon ve deneyim düzeyini seçin; yapay zeka sektörüne özel ATS uyumlu CV üretsin.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <GuidedBuilderDialog triggerText="Hemen Başla" />
          </div>
        </div>

        {/* Card 2: LinkedIn Sync (Apify) */}
        <div
          onClick={() => setActiveAction(activeAction === "linkedin" ? null : "linkedin")}
          className={`cursor-pointer rounded-2xl border transition-all p-5 flex flex-col justify-between group relative overflow-hidden ${
            activeAction === "linkedin"
              ? "border-blue-500 bg-blue-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs"
          }`}
        >
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] uppercase font-semibold">
              Apify
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
              <Linkedin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              LinkedIn İçe Aktar
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Genel LinkedIn profil URL&apos;nizi yapıştırarak tüm kariyer geçmişinizi tek tıkla çekin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium pt-2 border-t border-slate-100">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Profili Çek</span>
          </div>
        </div>

        {/* Card 3: PDF Resume Upload */}
        <div
          onClick={() => setActiveAction(activeAction === "pdf" ? null : "pdf")}
          className={`cursor-pointer rounded-2xl border transition-all p-5 flex flex-col justify-between group relative overflow-hidden ${
            activeAction === "pdf"
              ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs"
          }`}
        >
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-semibold">
              AI Ayrıştırıcı
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
              Mevcut PDF Yükle
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Eski PDF özgeçmişinizi yükleyin, Claude & Apify ile temiz ATS JSON formatına dönüştürelim.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-2 border-t border-slate-100">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>PDF Yükle</span>
          </div>
        </div>

        {/* Card 4: 1-Click Demo Resume */}
        <div
          onClick={handleLoadDemo}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] uppercase font-semibold">
              1 Tıkla Hazır
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
              Örnek CV Yükle
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tüm sistem özelliklerini test etmek için hazır dolu CV, Stripe analizi ve linki yükleyin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium pt-2 border-t border-slate-100">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            <span>Örnek Veri Yükle</span>
          </div>
        </div>
      </div>

      {/* Action Tray: LinkedIn Scrape Form */}
      {activeAction === "linkedin" && (
        <div className="rounded-2xl border border-blue-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn Profilinden İçe Aktar (Apify Entegrasyonu)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveAction(null)}
              className="text-xs text-slate-400 hover:text-slate-900"
            >
              Kapat
            </Button>
          </div>

          <form onSubmit={handleLinkedinImport} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/ad-soyad/"
                required
                className="bg-white border-slate-200 text-slate-900 text-xs h-10 flex-1 rounded-xl"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-10 px-6 rounded-xl shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Taranıyor...</span>
                  </>
                ) : (
                  <span>Profili Getir</span>
                )}
              </Button>
            </div>
          </form>

          {permissionUrl && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Apify profil kazıyıcı için bir kerelik izin onayı gerekiyor.</span>
              </div>
              <a
                href={permissionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline shrink-0"
              >
                <span>İzni Onayla</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Tray: PDF Upload Form */}
      {activeAction === "pdf" && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Upload className="h-4 w-4" />
              <span>PDF Özgeçmiş Yükle ve ATS JSON&apos;a Dönüştür</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveAction(null)}
              className="text-xs text-slate-400 hover:text-slate-900"
            >
              Kapat
            </Button>
          </div>

          <form onSubmit={handlePdfUpload} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                required
                className="bg-white border-slate-200 text-slate-900 text-xs h-10 flex-1 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700"
              />
              <Button
                type="submit"
                disabled={loading || !pdfFile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-6 rounded-xl shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Ayrıştırılıyor...</span>
                  </>
                ) : (
                  <span>PDF&apos;i Aktar</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
