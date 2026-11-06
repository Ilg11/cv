"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  CreditCard,
  Download,
  Trash2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Loader2,
  Sparkles,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SettingsViewProps {
  user: {
    id: string;
    email?: string;
  };
  profile: any;
}

export function SettingsView({ user, profile }: SettingsViewProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error("Hesap silinemedi");

      toast.success("Hesabınız ve tüm verileriniz kalıcı olarak silindi.");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "İşlem sırasında bir hata oluştu.");
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      toast.success("Oturum kapatıldı.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Çıkış yapılamadı");
      setLoggingOut(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Settings & Account
          </h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Manage your subscription status, export career data, and configure your account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Subscription */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Üyelik ve Plan Durumu
                </h3>
                <p className="text-xs text-slate-500">
                  CVForge B2C Profesyonel Aday Planı
                </p>
              </div>
            </div>

            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 self-start sm:self-auto font-medium text-xs px-3 py-1">
              7 Günlük Ücretsiz Deneme Aktif
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Plan Ücreti
              </span>
              <p className="font-bold text-slate-900 text-base">$99 / Yıl</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                İade Garantisi
              </span>
              <p className="font-bold text-slate-900 text-base">14 Gün Koşulsuz</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Paylaşılabilir Linkler
              </span>
              <p className="font-bold text-emerald-700 text-base">Sınırsız & Canlı</p>
            </div>
          </div>
        </div>

        {/* Card 2: Account Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Hesap Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">E-posta Adresi</span>
              <span className="font-medium text-slate-900">{user.email}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Kullanıcı Kimliği (ID)</span>
              <span className="font-mono text-slate-600 truncate block">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Data Guarantee (JSON Export) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Kariyer Verilerini Dışa Aktar (JSON)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  CVForge veri garantisi kapsamında aboneliğiniz bitse bile tüm özgeçmişlerinizi, ATS analizlerinizi ve profil verilerinizi istediğiniz an tek tıkla taşınabilir JSON formatında indirebilirsiniz.
                </p>
              </div>
            </div>

            <a href="/api/export/json" download="cvforge-career-data.json">
              <Button
                variant="outline"
                className="text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>JSON İndir</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Card 4: Danger Zone / Delete Account */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-rose-900 text-base">
                Tehlikeli Bölge: Hesabı ve Verileri Sil
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed max-w-xl">
                GDPR ve KVKK uyumlu kalıcı silme işlemi. Tüm özgeçmişleriniz, oluşturduğunuz işe alımcı linkleri ve analiz geçmişiniz geri döndürülemez şekilde sistemden kaldırılır.
              </p>
            </div>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl shrink-0"
                >
                  Hesabı Tamamen Sil
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-rose-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Hesabınızı Silmek İstediğinize Emin Misiniz?</span>
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-xs leading-relaxed pt-2">
                    Bu işlem geri alınamaz. Tüm kayıtlı özgeçmişleriniz, aktif işe alımcı linkleriniz ve ATS analiz raporlarınız kalıcı olarak silinecektir.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleting}
                    className="text-xs"
                  >
                    Vazgeç
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="text-xs bg-rose-600 hover:bg-rose-700 gap-1.5"
                  >
                    {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Evet, Hesabımı Kalıcı Olarak Sil</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Card 5: Log out */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="text-xs text-slate-500 hover:text-slate-900 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Oturumu Kapat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
