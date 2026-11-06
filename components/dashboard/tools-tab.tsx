"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Zap,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function ToolsTab({ userEmail }: { userEmail: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleExportJson = async () => {
    setDownloading(true);
    toast.info("Tüm kariyer verileriniz JSON formatında hazırlanıyor...");
    try {
      const res = await fetch("/api/export/json");
      if (!res.ok) throw new Error("Veri dışa aktarılamadı");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cvforge-career-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Kariyer verileriniz başarıyla indirildi!");
    } catch (err: any) {
      toast.error(err.message || "İndirme başarısız oldu");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card 1: Data Portability & Export */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-white text-base">Kariyer Verilerini Dışa Aktar (JSON)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Platformumuzda bulunan tüm özgeçmişlerinizi, iş deneyimlerinizi, eğitim bilgilerinizi ve ATS analizlerinizi taşınabilir, standart JSON formatında yedekleyin. Üyeliğiniz dursa dahi verilerinize her zaman erişebilirsiniz.
          </p>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2 mb-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tüm özgeçmişler ve geçmiş versiyonlar dahil</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Standardize Schema (OpenResume & JSON Resume uyumlu)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Veri kilitlenmesi yok, %100 taşınabilir</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleExportJson}
          disabled={downloading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          JSON Veri Paketini İndir
        </Button>
      </div>

      {/* Card 2: ATS Golden Rules Checklist */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-white text-base">ATS Uyumlu CV Altın Kuralları</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Şirketlerin kullandığı İşe Alım Takip Sistemleri (Taleo, Workday, Greenhouse) tarafından %100 okunabilir kalmak için CVForge şu kuralları uygular:
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-semibold text-indigo-400 block mb-0.5">1. Google XYZ Formülü</span>
              Maddeler: &quot;[X] hedefini [Y] ile ölçülebilir şekilde [Z] yaparak başardım&quot; formatında yazılır.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-semibold text-emerald-400 block mb-0.5">2. Tablosuz & Sütunsuz Temiz Yapı</span>
              ATS robotlarının içeriği sırayla okuyabilmesi için karmaşık çoklu sütun ve tablolardan kaçınılır.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-semibold text-purple-400 block mb-0.5">3. Standart Bölüm Başlıkları</span>
              Experience, Education, Skills gibi evrensel kabul gören başlıklar kullanılır.
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Kullanıcı: {userEmail}</span>
          <Link href="/billing" className="text-indigo-400 hover:underline flex items-center gap-1">
            <CreditCard className="h-3 w-3" /> Üyelik Ayarları
          </Link>
        </div>
      </div>
    </div>
  );
}
