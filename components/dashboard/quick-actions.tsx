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
} from "lucide-react";
import { toast } from "sonner";

export function QuickActions({
  hasResumes,
  onCreated,
}: {
  hasResumes: boolean;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<"demo" | "linkedin" | "pdf" | "scratch" | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("Kıdemli Yazılım Mühendisi");
  const [template, setTemplate] = useState<"classic" | "modern" | "compact">("modern");

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

  // LinkedIn Import
  const handleLinkedInImport = async () => {
    if (!linkedinUrl.includes("linkedin.com/in/")) {
      toast.error("Lütfen geçerli bir LinkedIn profil bağlantısı girin (örn: https://linkedin.com/in/ad-soyad)");
      return;
    }
    setLoading(true);
    toast.info("Apify LinkedIn profilinizi tarıyor (~20 saniye sürebilir)...");
    try {
      const res = await fetch("/api/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl, title: "LinkedIn Senkronize CV" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LinkedIn aktarımı başarısız oldu");
      toast.success("LinkedIn profiliniz başarıyla ATS formatında CV'ye dönüştürüldü!");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Profil aktarılamadı");
    } finally {
      setLoading(false);
    }
  };

  // PDF Upload
  const handlePdfUpload = async () => {
    if (!pdfFile) {
      toast.error("Lütfen önce bir PDF dosyası seçin");
      return;
    }
    setLoading(true);
    toast.info("Apify & AI ile PDF özgeçmişiniz analiz ediliyor...");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", pdfFile.name.replace(".pdf", ""));

      const res = await fetch("/api/import/pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PDF ayrıştırma başarısız oldu");
      toast.success("PDF başarıyla ATS formatına aktarıldı!");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "PDF işlenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Scratch Create
  const handleCreateScratch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Yeni Özgeçmiş", template, source: "scratch" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Özgeçmiş oluşturulamadı");
      toast.success("Yeni ATS özgeçmişiniz oluşturuldu!");
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Hızlı Eylem Merkezi
          </h2>
          <p className="text-xs text-slate-400">
            Tek tıkla örnek profil yükleyin, LinkedIn veya PDF ile içe aktarın ya da sıfırdan ATS uyumlu başlayın.
          </p>
        </div>
        {activeAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveAction(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Vazgeç
          </Button>
        )}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: 1-Click Demo */}
        <div
          onClick={handleLoadDemo}
          className={`cursor-pointer rounded-2xl border transition-all p-4 flex flex-col justify-between group relative overflow-hidden ${
            loading
              ? "opacity-60 pointer-events-none"
              : "border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/90 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10"
          }`}
        >
          <div className="absolute top-2.5 right-2.5">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] uppercase font-semibold">
              1-Tıkla Hazır
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
              Örnek ATS CV Yükle
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Kıdemli Mühendis hazır profili, Stripe ATS analizi ve işe alımcı linkiyle anında deneyin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium pt-2 border-t border-slate-800/80">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            <span>Anında Yükle</span>
          </div>
        </div>

        {/* Card 2: LinkedIn Sync */}
        <div
          onClick={() => setActiveAction(activeAction === "linkedin" ? null : "linkedin")}
          className={`cursor-pointer rounded-2xl border transition-all p-4 flex flex-col justify-between group relative overflow-hidden ${
            activeAction === "linkedin"
              ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-blue-500/50 hover:bg-slate-900/90"
          }`}
        >
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] uppercase font-semibold">
              Apify
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2.5 group-hover:scale-105 transition-transform">
              <Linkedin className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">
              LinkedIn İçe Aktar
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Genel LinkedIn profil URL'nizi yapıştırarak tüm kariyer geçmişinizi tek tıkla çekin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium pt-2 border-t border-slate-800/80">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Profili Çek</span>
          </div>
        </div>

        {/* Card 3: PDF Resume Upload */}
        <div
          onClick={() => setActiveAction(activeAction === "pdf" ? null : "pdf")}
          className={`cursor-pointer rounded-2xl border transition-all p-4 flex flex-col justify-between group relative overflow-hidden ${
            activeAction === "pdf"
              ? "border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900/90"
          }`}
        >
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-semibold">
              AI Ayrıştırıcı
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
              Mevcut PDF Yükle
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Eski PDF özgeçmişinizi yükleyin, Claude & Apify ile temiz ATS JSON formatına dönüştürelim.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-2 border-t border-slate-800/80">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>PDF Yükle</span>
          </div>
        </div>

        {/* Card 4: Scratch ATS */}
        <div
          onClick={() => setActiveAction(activeAction === "scratch" ? null : "scratch")}
          className={`cursor-pointer rounded-2xl border transition-all p-4 flex flex-col justify-between group relative overflow-hidden ${
            activeAction === "scratch"
              ? "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-purple-500/50 hover:bg-slate-900/90"
          }`}
        >
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[10px] uppercase font-semibold">
              3 Şablon
            </Badge>
          </div>
          <div className="mb-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2.5 group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
              Sıfırdan ATS CV
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Classic, Modern veya Compact kanıtlanmış şablon yapısıyla doğrudan düzenleyiciyi açın.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium pt-2 border-t border-slate-800/80">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Şablon Seç</span>
          </div>
        </div>
      </div>

      {/* Expandable Inline Action Form */}
      {activeAction === "linkedin" && (
        <div className="rounded-2xl border border-blue-500/40 bg-slate-900/90 p-5 backdrop-blur-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin className="h-5 w-5 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">LinkedIn Profilinden İçe Aktarma (Apify)</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Herkese açık profil bağlantınızı yapıştırın. Deneyimleriniz, eğitiminiz ve yetenekleriniz otomatik ayrıştırılarak ATS standartlarında yeni bir CV oluşturulacaktır.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="https://www.linkedin.com/in/ad-soyad"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={loading}
              className="bg-slate-950 border-slate-800 text-white flex-1"
            />
            <Button
              onClick={handleLinkedInImport}
              disabled={loading || !linkedinUrl}
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Apify Taranıyor..." : "Profili İçe Aktar"}
            </Button>
          </div>
        </div>
      )}

      {activeAction === "pdf" && (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 backdrop-blur-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="h-5 w-5 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Mevcut PDF CV Ayrıştırıcı</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Mevcut PDF dosyanızı yükleyin (maks 5MB). İçerik taranacak ve doğrudan düzenlenebilir ATS formatına dönüştürülecektir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="bg-slate-950 border-slate-800 text-white file:bg-slate-800 file:text-white file:border-0 file:rounded-md file:px-2 file:text-xs"
            />
            <Button
              onClick={handlePdfUpload}
              disabled={loading || !pdfFile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shrink-0 w-full sm:w-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "Ayrıştırılıyor..." : "PDF'i Dönüştür"}
            </Button>
          </div>
        </div>
      )}

      {activeAction === "scratch" && (
        <div className="rounded-2xl border border-purple-500/40 bg-slate-900/90 p-5 backdrop-blur-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Sıfırdan Yeni ATS Özgeçmişi</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Özgeçmiş Başlığı</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Kıdemli Yazılım Mühendisi"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">ATS Şablon Formatı</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["classic", "modern", "compact"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border capitalize transition-all ${
                      template === t
                        ? "border-purple-500 bg-purple-950/60 text-white"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button
            onClick={handleCreateScratch}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white gap-2 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Özgeçmişi Oluştur ve Düzenleyiciye Git
          </Button>
        </div>
      )}
    </div>
  );
}
