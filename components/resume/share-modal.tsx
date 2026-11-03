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

export function ShareModal({
  resumeId,
  existingLinks = [],
  onLinkCreated,
}: {
  resumeId: string;
  existingLinks: any[];
  onLinkCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create share link");

      toast.success("Shareable CV link generated!");
      setCompanyName("");
      if (onLinkCreated) onLinkCreated();
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
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          <span>Share Link</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Live Resume Link
          </DialogTitle>
          <DialogDescription>
            Create unique, trackable web links to share directly with recruiters or attach to your applications.
          </DialogDescription>
        </DialogHeader>

        {/* Honesty Notice (B3 requirement) */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Honesty & Privacy Guarantee:</span>
            Your shared link works continuously while your account has active access. If your subscription ends, the link will pause and display a polite, neutral notice.
          </div>
        </div>

        {/* Create Link Input */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="company-label" className="text-xs">
              Target Company Label (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="company-label"
                placeholder="e.g. Google, Stripe, or General Application"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleCreateLink} disabled={loading} className="shrink-0 gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Links List */}
        {existingLinks && existingLinks.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">Existing Active Links</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {existingLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-xs bg-slate-50/50"
                >
                  <div className="space-y-0.5 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        /cv/{link.slug}
                      </span>
                      {link.company_name && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {link.company_name}
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] block">
                      Views: {link.view_count || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(link.slug)}
                    >
                      {copiedSlug === link.slug ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <a
                      href={`/cv/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-900 p-1.5"
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
