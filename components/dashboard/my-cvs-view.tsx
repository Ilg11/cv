"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Target,
  Copy,
  Trash2,
  Share2,
  Download,
  Calendar,
  Loader2,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateResumeDialog } from "@/components/resume/create-dialog";
import { ShareModal } from "@/components/resume/share-modal";
import { toast } from "sonner";

interface MyCvsViewProps {
  initialResumes: any[];
}

export function MyCvsView({ initialResumes }: MyCvsViewProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes || []);
  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [shareModalResume, setShareModalResume] = useState<any | null>(null);

  const filteredResumes = resumes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesTemplate = templateFilter === "all" || r.template === templateFilter;
    return matchesSearch && matchesTemplate;
  });

  const handleDuplicate = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Çoğaltılamadı");
      const clone = await res.json();
      setResumes([clone, ...resumes]);
      toast.success("Özgeçmiş başarıyla kopyalandı!");
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
      setResumes(resumes.filter((r) => r.id !== id));
      toast.success("Özgeçmiş silindi.");
    } catch (err: any) {
      toast.error(err.message || "Özgeçmiş silinemedi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateDemo = async () => {
    setSeedingDemo(true);
    try {
      const res = await fetch("/api/resumes/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo CV oluşturulamadı");

      setResumes([data, ...resumes]);
      toast.success("Örnek demo CV oluşturuldu!");
    } catch (err: any) {
      toast.error(err.message || "Hata oluştu");
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              My CVs
            </h1>
          </div>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Create, manage, duplicate, optimize and share your ATS-compliant resumes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleCreateDemo}
            disabled={seedingDemo}
            className="text-xs h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            {seedingDemo ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            )}
            <span>Örnek Demo CV</span>
          </Button>

          <CreateResumeDialog
            onCreated={(newResume) => {
              setResumes([newResume, ...resumes]);
            }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Özgeçmiş başlığı ile ara..."
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shrink-0">
          {[
            { id: "all", label: "Tümü" },
            { id: "classic", label: "Classic" },
            { id: "modern", label: "Modern" },
            { id: "compact", label: "Compact" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                templateFilter === t.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CV Grid */}
      {filteredResumes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-semibold text-slate-900 text-lg">
              Henüz Özgeçmiş Bulunmuyor
            </h3>
            <p className="text-slate-500 text-sm">
              İlk ATS uyumlu özgeçmişinizi oluşturun veya hazır şablonlu örnek CV ekleyin.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleCreateDemo}
              disabled={seedingDemo}
              variant="outline"
              className="text-xs"
            >
              Örnek CV ile Başla
            </Button>
            <CreateResumeDialog
              onCreated={(newResume) => {
                setResumes([newResume, ...resumes]);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => {
            const sharedLink = resume.shared_links?.[0];
            const isCloning = actionLoadingId === resume.id;

            return (
              <div
                key={resume.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {resume.template || "Classic"}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-900"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white">
                        <DropdownMenuItem asChild>
                          <Link href={`/resumes/${resume.id}`}>Düzenle</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/resumes/${resume.id}/optimize`}>
                            ATS Analizi Yap
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume.id)}>
                          Kopyasını Oluştur
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/api/pdf/${resume.id}`}
                            download={`${resume.title || "resume"}.pdf`}
                          >
                            PDF Olarak İndir
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(resume.id, resume.title)}
                          className="text-rose-600"
                        >
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Son düzenleme:{" "}
                        {new Date(resume.updated_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link href={`/resumes/${resume.id}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl shadow-xs"
                    >
                      Düzenle
                    </Button>
                  </Link>

                  <Link href={`/resumes/${resume.id}/optimize`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                      title="ATS Optimize Et"
                    >
                      <Target className="h-3.5 w-3.5 text-indigo-600" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShareModalResume(resume)}
                    className="h-9 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                    title="İşe Alımcı Linki Paylaş"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal Dialog */}
      {shareModalResume && (
        <ShareModal
          resumeId={shareModalResume.id}
          resumeTitle={shareModalResume.title}
          existingLink={shareModalResume.shared_links?.[0]}
          onClose={() => setShareModalResume(null)}
        />
      )}
    </div>
  );
}
