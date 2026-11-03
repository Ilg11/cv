"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeContent, defaultResumeContent } from "@/lib/resume/schema";
import { EditorForm } from "@/components/resume/editor-form";
import { ResumeRenderer } from "@/components/resume/templates";
import { ShareModal } from "@/components/resume/share-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Download,
  Target,
  Check,
  Loader2,
  Eye,
  Edit3,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function ResumeEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [content, setContent] = useState<ResumeContent>(defaultResumeContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial resume
  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${params.id}`);
        if (!res.ok) throw new Error("Resume not found");
        const data = await res.json();
        setResume(data);
        setTitle(data.title || "Untitled Resume");
        setTemplate(data.template || "modern");
        if (data.content && Object.keys(data.content).length > 0) {
          setContent(data.content);
        }
      } catch (err: any) {
        toast.error(err.message);
        router.push("/dashboard");
      }
    }
    fetchResume();
  }, [params.id, router]);

  // Debounced Autosave (1.5s after change)
  const saveChanges = async (newTitle: string, newTemplate: string, newContent: ResumeContent) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          template: newTemplate,
          content: newContent,
        }),
      });
      if (!res.ok) throw new Error("Autosave failed");
      setLastSaved(new Date());
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (updated: ResumeContent) => {
    setContent(updated);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(title, template, updated);
    }, 1500);
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    saveChanges(title, newTemplate, content);
  };

  const handleTitleBlur = () => {
    saveChanges(title, template, content);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate ATS readiness percentage
  const calculateReadiness = (c: ResumeContent) => {
    let score = 0;
    if (c.basics?.fullName && c.basics?.email) score += 20;
    if (c.basics?.summary && c.basics.summary.length > 30) score += 20;
    if (c.experience && c.experience.length > 0) score += 30;
    if (c.education && c.education.length > 0) score += 15;
    if (c.skills && c.skills.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness(content);

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-xs print:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="h-8 w-44 sm:w-60 font-semibold text-slate-800 text-sm border-transparent hover:border-slate-300 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* ATS Readiness Badge */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
              <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-slate-600">Completeness:</span>
              <span className="font-bold text-slate-900">{readinessScore}%</span>
            </div>

            {/* Autosave status indicator */}
            <span className="text-xs text-slate-400 hidden md:inline-flex items-center gap-1 mr-1">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" /> Saved
                </>
              ) : null}
            </span>

            {/* Template selector */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(["classic", "modern", "compact"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTemplateChange(t)}
                  className={`capitalize px-2.5 py-1 rounded-md transition-colors ${
                    template === t
                      ? "bg-white font-semibold text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <div className="hidden xl:flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(["a4", "letter"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={`uppercase px-2 py-1 rounded-md transition-colors ${
                    pageSize === s
                      ? "bg-white font-semibold text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* AI Optimizer button */}
            <Link href={`/resumes/${params.id}/optimize`}>
              <Button size="sm" className="gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs">
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ATS Optimize</span>
              </Button>
            </Link>

            {/* Share Link Modal */}
            <ShareModal
              resumeId={params.id}
              existingLinks={resume.shared_links || []}
              onLinkCreated={() => {
                fetch(`/api/resumes/${params.id}`)
                  .then((res) => res.json())
                  .then((data) => setResume(data));
              }}
            />

            {/* Print / PDF button */}
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 border-slate-200 text-slate-700">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b bg-white p-2 justify-center gap-2 print:hidden">
        <Button
          variant={activeTab === "edit" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("edit")}
          className="gap-1.5 text-xs flex-1"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Form
        </Button>
        <Button
          variant={activeTab === "preview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("preview")}
          className="gap-1.5 text-xs flex-1"
        >
          <Eye className="h-3.5 w-3.5" />
          Live Preview
        </Button>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Form Editor */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 lg:border-r border-slate-200 bg-slate-50 print:hidden ${
            activeTab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <EditorForm content={content} onChange={handleContentChange} />
          </div>
        </div>

        {/* Right: Live ATS Preview */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center items-start print:p-0 print:bg-white print:w-full ${
            activeTab === "preview" ? "block" : "hidden lg:flex"
          }`}
        >
          <div className={`w-full bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none ${
            pageSize === "a4" ? "max-w-[794px]" : "max-w-[816px]"
          }`}>
            <ResumeRenderer template={template} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
