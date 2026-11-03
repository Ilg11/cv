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

export function CreateResumeDialog({ buttonText = "New Resume" }: { buttonText?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("My Resume");
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
        body: JSON.stringify({ title, source: "scratch" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create resume");

      toast.success("Resume created!");
      setOpen(false);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedinUrl.includes("linkedin.com/in/")) {
      toast.error("Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)");
      return;
    }

    setLoading(true);
    toast.info("Apify is scraping LinkedIn profile... This takes ~20-30 seconds.");
    try {
      const res = await fetch("/api/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl, title: title || "LinkedIn Imported Resume" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import from LinkedIn");

      toast.success("LinkedIn profile imported successfully!");
      setOpen(false);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to import LinkedIn profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    toast.info("Parsing resume with Apify & AI... Please wait.");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", title || pdfFile.name.replace(".pdf", ""));

      const res = await fetch("/api/import/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF");

      toast.success("PDF resume parsed and created!");
      setOpen(false);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to parse PDF file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Create New Resume
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Start from scratch, sync with LinkedIn (Apify), or upload an existing PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="resume-title" className="text-xs text-slate-300">
              Resume Title
            </Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              disabled={loading}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <Tabs defaultValue="scratch" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-950 border border-slate-800">
              <TabsTrigger value="scratch" className="gap-1 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <FileText className="h-3.5 w-3.5" />
                Scratch
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="gap-1 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-1 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                Upload PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scratch" className="space-y-3 pt-3">
              <p className="text-xs text-slate-400">
                Start with our battle-tested ATS template structure pre-filled with clean examples.
              </p>
              <Button onClick={handleCreateScratch} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create & Open Editor
              </Button>
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin-url" className="text-xs text-slate-300">
                  Public LinkedIn Profile URL
                </Label>
                <Input
                  id="linkedin-url"
                  placeholder="https://www.linkedin.com/in/alex-smith"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={loading}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <Button onClick={handleLinkedInImport} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Scraping Profile (Apify)..." : "Sync LinkedIn with Apify"}
              </Button>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="pdf-file" className="text-xs text-slate-300">
                  Select PDF Resume (&le; 5MB)
                </Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="bg-slate-950 border-slate-800 text-white file:bg-slate-800 file:text-white file:border-0 file:rounded-md file:px-2 file:text-xs"
                />
              </div>
              <Button onClick={handlePdfUpload} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading || !pdfFile}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading ? "Parsing PDF with AI..." : "Parse PDF & Create"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
