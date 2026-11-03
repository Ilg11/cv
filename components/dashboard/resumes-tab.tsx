"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Calendar,
  Target,
  Copy,
  Trash2,
  Share2,
  MoreVertical,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareModal } from "@/components/resume/share-modal";
import { CreateResumeDialog } from "@/components/resume/create-dialog";
import { toast } from "sonner";

export function ResumesTab({ resumes }: { resumes: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredResumes = (resumes || []).filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesTemplate = templateFilter === "all" || r.template === templateFilter;
    return matchesSearch && matchesTemplate;
  });

  const handleDuplicate = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Çoğaltılamadı");
      toast.success("Özgeçmiş başarıyla kopyalandı!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Özgeçmiş kopyalanamadı");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı özgeçmişi silmek istediğinizden emin misiniz?`)) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      toast.success("Özgeçmiş silindi.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Özgeçmiş silinemedi");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Özgeçmiş ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-9"
          />
        </div>

        {/* Template Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Tümü" },
            { id: "classic", label: "Classic" },
            { id: "modern", label: "Modern" },
            { id: "compact", label: "Compact" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTemplateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                templateFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <CreateResumeDialog buttonText="+ Yeni CV" />
        </div>
      </div>

      {/* Grid of Resumes */}
      {filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => {
            const links = resume.shared_links || [];
            const activeLinks = links.filter((l: any) => l.is_active);
            const views = links.reduce((sum: number, l: any) => sum + (l.view_count || 0), 0);
            const isLoading = actionLoadingId === resume.id;

            return (
              <div
                key={resume.id}
                className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-indigo-500/5 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {resume.title}
                    </h3>

                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className="border-slate-700 bg-slate-800/80 text-slate-300 text-[10px] uppercase font-semibold"
                      >
                        {resume.template}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-900 border-slate-800 text-slate-200 text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(resume.id)}
                            disabled={isLoading}
                            className="cursor-pointer gap-2 hover:bg-slate-800"
                          >
                            <Copy className="h-3.5 w-3.5 text-indigo-400" /> Çoğalt / Kopyala
                          </DropdownMenuItem>
                          <a
                            href={`/api/pdf/${resume.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-800 rounded-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-emerald-400" /> PDF Olarak İndir
                          </a>
                          <DropdownMenuItem
                            onClick={() => handleDelete(resume.id, resume.title)}
                            disabled={isLoading}
                            className="cursor-pointer gap-2 text-rose-400 hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Özgeçmişi Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-4">
                    <Calendar className="h-3 w-3" />
                    Son güncelleme: {new Date(resume.updated_at).toLocaleDateString("tr-TR")}
                  </p>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between text-slate-400">
                      <span>Oluşturma Kaynağı:</span>
                      <span className="font-medium text-slate-200 capitalize">
                        {resume.source === "linkedin"
                          ? "LinkedIn (Apify)"
                          : resume.source === "pdf"
                          ? "PDF Ayrıştırıcı"
                          : "Sıfırdan"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Aktif İşe Alımcı Linki:</span>
                      <span className="font-medium text-slate-200">{activeLinks.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>İşe Alımcı Görüntüleme:</span>
                      <span className="font-semibold text-emerald-400">{views}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Link href={`/resumes/${resume.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                      >
                        Düzenle
                      </Button>
                    </Link>
                    <Link href={`/resumes/${resume.id}/optimize`}>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                      >
                        <Target className="h-3.5 w-3.5" />
                        Optimize Et
                      </Button>
                    </Link>
                  </div>

                  <div className="w-full">
                    <ShareModal resumeId={resume.id} existingLinks={resume.shared_links || []} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white text-base">
            {search ? "Aramaya uygun özgeçmiş bulunamadı" : "Henüz hiçbir özgeçmiş oluşturulmadı"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Yukarıdaki Hızlı Eylem Merkezi'nden "Örnek ATS CV Yükle"ye tıklayarak hemen hazır bir CV deneyebilir veya yeni bir tane oluşturabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
