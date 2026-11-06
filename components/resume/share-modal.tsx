"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  resumeId: string;
  resumeTitle?: string;
  existingLinks?: any[];
  existingLink?: any;
  onLinkCreated?: () => void;
  onClose?: () => void;
}

export function ShareModal({
  resumeId,
  resumeTitle,
  existingLinks = [],
  existingLink,
  onLinkCreated,
  onClose,
}: ShareModalProps) {
  const [open, setOpen] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Combine links
  const linksList = existingLink ? [existingLink] : existingLinks;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paylaşım linki oluşturulamadı");

      toast.success("Özgeçmiş paylaşım linki oluşturuldu!");
      setCompanyName("");
      if (onLinkCreated) onLinkCreated();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/cv/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Link panoya kopyalandı!");
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 text-lg">
            <Share2 className="h-5 w-5 text-indigo-600" />
            İşe Alımcı Linki Paylaş
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            {resumeTitle ? `"${resumeTitle}" için ` : ""}
            İş başvurularınıza ekleyebileceğiniz, görüntülenme sayısını takip edebileceğiniz özel web bağlantısı oluşturun.
          </DialogDescription>
        </DialogHeader>

        {/* Honesty Notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-amber-950">Şeffaflık & Gizlilik İlkesi:</span>
            Oluşturduğunuz link, üyeliğiniz aktif olduğu sürece kesintisiz çalışır. Üyeliğiniz sona ererse link nazik ve tarafsız bir mesajla duraklatılır; işe alımcılara herhangi bir reklam gösterilmez.
          </div>
        </div>

        {/* Create Link Input */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="company-label" className="text-xs text-slate-700 font-medium">
              Hedef Şirket veya Başvuru Etiketi (Opsiyonel)
            </Label>
            <div className="flex gap-2">
              <Input
                id="company-label"
                placeholder="Örn: Google, Stripe veya Genel Başvuru"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
              />
              <Button
                onClick={handleCreateLink}
                disabled={loading}
                className="shrink-0 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-10 px-4 shadow-xs"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                <span>Link Üret</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Links List */}
        {linksList && linksList.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">Mevcut Aktif Linkler</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {linksList.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs bg-slate-50"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-900 truncate block">
                      {link.company_name || "Genel Paylaşım"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      /cv/{link.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600">
                      {link.view_count || 0} görüntülenme
                    </Badge>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => copyToClipboard(link.slug)}
                    >
                      {copiedSlug === link.slug ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-600" />
                      )}
                    </Button>

                    <a
                      href={`/cv/${link.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-900 p-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
