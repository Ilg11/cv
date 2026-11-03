"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share2,
  Copy,
  Check,
  Eye,
  ExternalLink,
  ShieldCheck,
  Building2,
  Plus,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function RecruiterLinksList({
  links,
  resumes,
}: {
  links: any[];
  resumes: any[];
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // New Link Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(resumes?.[0]?.id || "");
  const [companyName, setCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCopy = (slug: string, id: string) => {
    const url = `${window.location.origin}/cv/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("İşe alımcı bağlantısı panoya kopyalandı!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    setTogglingId(linkId);
    try {
      const res = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Durum güncellenemedi");
      toast.success(
        !currentStatus
          ? "Bağlantı aktifleştirildi! İşe alımcılar artık CV'yi görüntüleyebilir."
          : "Bağlantı duraklatıldı! İşe alımcılara kibar erişim kapalı bildirimi gösterilir."
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Bağlantı durumu değiştirilemedi");
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateNewLink = async () => {
    if (!selectedResumeId) {
      toast.error("Lütfen bir özgeçmiş seçin");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResumeId, companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bağlantı oluşturulamadı");
      toast.success("Yeni işe alımcı bağlantısı oluşturuldu!");
      setCompanyName("");
      setOpenModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Share2 className="h-4 w-4 text-violet-400" /> Aktif İşe Alımcı Bağlantıları & Telemetri
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Başvurularınız için özel web linkleri oluşturun, işe alımcıların görüntüleme sayısını takip edin ve dilediğinizde erişimi duraklatın.
          </p>
        </div>

        {/* Create Link Dialog Trigger */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              disabled={!resumes?.length}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5 text-xs shadow-md shrink-0"
            >
              <Plus className="h-4 w-4" /> Yeni İşe Alımcı Linki
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-white text-base flex items-center gap-2">
                <Share2 className="h-5 w-5 text-violet-400" /> Yeni İşe Alımcı Bağlantısı
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Bu bağlantıyı iş başvurularınıza veya LinkedIn mesajlarınıza ekleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Paylaşılacak Özgeçmiş</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-10 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.template})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Hedef Şirket veya Etiket (İsteğe Bağlı)</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Google, Trendyol, Stripe Başvurusu"
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                />
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-xs text-violet-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <p>
                  Link Lock-in Güvencesi: Bağlantınız aktif aboneliğiniz sürdüğü müddetçe kesintisiz çalışır. Dilediğiniz an duraklatabilir veya tekrar açabilirsiniz.
                </p>
              </div>

              <Button
                onClick={handleCreateNewLink}
                disabled={creating}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2 text-xs"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Bağlantıyı Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links List */}
      {links && links.length > 0 ? (
        <div className="space-y-3">
          {links.map((link) => {
            const isCopied = copiedId === link.id;
            const isToggling = togglingId === link.id;

            return (
              <div
                key={link.id}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md ${
                  link.is_active
                    ? "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                    : "border-slate-800/50 bg-slate-950/50 opacity-75"
                }`}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {link.company_name || "Genel Başvuru Bağlantısı"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        link.is_active
                          ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                          : "border-slate-700 bg-slate-800 text-slate-400"
                      }`}
                    >
                      {link.is_active ? "Yayında / Aktif" : "Duraklatıldı"}
                    </Badge>
                    {link.resumes?.title && (
                      <span className="text-[11px] text-slate-500">
                        &bull; CV: {link.resumes.title}
                      </span>
                    )}
                  </div>

                  {/* Slug Bar */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <code className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-violet-300 font-mono text-[11px]">
                      /cv/{link.slug}
                    </code>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Eye className="h-3.5 w-3.5" /> {link.view_count || 0} Görüntüleme
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-between md:justify-end">
                  {/* Active Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`switch-${link.id}`} className="text-xs text-slate-400 cursor-pointer">
                      {link.is_active ? "Yayında" : "Duraklat"}
                    </Label>
                    <Switch
                      id={`switch-${link.id}`}
                      checked={link.is_active}
                      disabled={isToggling}
                      onCheckedChange={() => handleToggleActive(link.id, link.is_active)}
                    />
                  </div>

                  {/* Copy Link Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(link.slug, link.id)}
                    className="gap-1.5 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? "Kopyalandı!" : "Linki Kopyala"}</span>
                  </Button>

                  {/* Preview External Link */}
                  <a
                    href={`/cv/${link.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="İşe alımcı sayfasını yeni sekmede gör"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-3">
            <Share2 className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white text-base">Henüz İşe Alımcı Bağlantısı Oluşturulmadı</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            CV'nizi şirketlere özel güvenli web bağlantısı olarak gönderin. İşe alımcılar tıkladıkça görüntüleme sayısını anlık takip edin.
          </p>
          <Button
            size="sm"
            onClick={() => setOpenModal(true)}
            disabled={!resumes?.length}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> İlk Bağlantınızı Oluşturun
          </Button>
        </div>
      )}
    </div>
  );
}
