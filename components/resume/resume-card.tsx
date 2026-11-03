"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Copy,
  Trash2,
  Target,
  Share2,
  Eye,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ResumeCard({ resume }: { resume: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const links = resume.shared_links || [];
  const activeLinks = links.filter((l: any) => l.is_active);
  const views = links.reduce((sum: number, l: any) => sum + (l.view_count || 0), 0);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate");
      toast.success("Resume duplicated!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${resume.title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Resume deleted.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-indigo-500/5 group relative">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {resume.title}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 text-[10px] uppercase">
              {resume.template}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                <DropdownMenuItem onClick={handleDuplicate} disabled={loading} className="cursor-pointer gap-2 hover:bg-slate-800">
                  <Copy className="h-3.5 w-3.5 text-indigo-400" /> Duplicate Resume
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={loading} className="cursor-pointer gap-2 text-rose-400 hover:bg-rose-950/40">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Resume
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-4">
          <Calendar className="h-3 w-3" />
          Updated {new Date(resume.updated_at).toLocaleDateString()}
        </p>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs space-y-1.5 mb-4">
          <div className="flex justify-between text-slate-400">
            <span>Source:</span>
            <span className="font-medium text-slate-200 capitalize">{resume.source}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Active Links:</span>
            <span className="font-medium text-slate-200">{activeLinks.length}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Recruiter Views:</span>
            <span className="font-semibold text-emerald-400">{views}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        <Link href={`/resumes/${resume.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 hover:bg-slate-800 text-slate-200">
            Edit Resume
          </Button>
        </Link>
        <Link href={`/resumes/${resume.id}/optimize`}>
          <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
            <Target className="h-3.5 w-3.5" />
            Optimize
          </Button>
        </Link>
      </div>
    </div>
  );
}
