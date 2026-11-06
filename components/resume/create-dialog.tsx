"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles, FileText, Linkedin, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreateResumeDialog({
  buttonText = "Yeni Özgeçmiş",
  onCreated,
}: {
  buttonText?: string;
  onCreated?: (resume: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Yazılım Mühendisi");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateScratch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          template: "modern",
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

      toast.success("Özgeçmiş oluşturuldu!");
      setOpen(false);
      if (onCreated) onCreated(data);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedinUrl.includes("linkedin.com/in/")) {
      toast.error("Lütfen geçerli bir LinkedIn profil linki girin (linkedin.com/in/...)");
      return;
    }

    setLoading(true);
    toast.info("Apify ile LinkedIn profili taranıyor...");
    try {
      const res = await fetch("/api/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: linkedinUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LinkedIn profili çekilemedi");

      toast.success("LinkedIn profili aktarıldı!");
      setOpen(false);
      if (onCreated) onCreated(data);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
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

      toast.success("PDF başarıyla aktarıldı!");
      setOpen(false);
      if (onCreated) onCreated(data);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "PDF ayrıştırma başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 text-xs px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-xs">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Yeni Özgeçmiş Oluştur
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Sıfırdan başlayın, LinkedIn profilinizi Apify ile senkronize edin veya mevcut PDF yükleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="resume-title" className="text-xs text-slate-700 font-medium">
              Özgeçmiş Başlığı
            </Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Senior Full Stack Developer"
              disabled={loading}
              className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
            />
          </div>

          <Tabs defaultValue="scratch" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="scratch" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg">
                <FileText className="h-3.5 w-3.5" />
                Sıfırdan
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg">
                <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg">
                <Upload className="h-3.5 w-3.5 text-emerald-600" />
                PDF Yükle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scratch" className="space-y-3 pt-3">
              <p className="text-xs text-slate-500">
                Kanıtlanmış ATS şablon yapısıyla temiz bir başlangıç yapın.
              </p>
              <Button onClick={handleCreateScratch} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-10 shadow-xs" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Oluştur & Düzenleyiciyi Aç
              </Button>
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin-url" className="text-xs text-slate-700 font-medium">
                  Genel LinkedIn Profil Bağlantısı
                </Label>
                <Input
                  id="linkedin-url"
                  placeholder="https://www.linkedin.com/in/ad-soyad"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={loading}
                  className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl"
                />
              </div>
              <Button onClick={handleLinkedInImport} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs h-10 shadow-xs" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Profil Çekiliyor (Apify)..." : "LinkedIn ile Senkronize Et"}
              </Button>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="pdf-file" className="text-xs text-slate-700 font-medium">
                  PDF Dosyası Seçin (&le; 5MB)
                </Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="bg-white border-slate-200 text-slate-900 text-xs h-10 rounded-xl file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700"
                />
              </div>
              <Button onClick={handlePdfUpload} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-10 shadow-xs" disabled={loading || !pdfFile}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading ? "Ayrıştırılıyor..." : "PDF'i Ayrıştır & Başla"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
