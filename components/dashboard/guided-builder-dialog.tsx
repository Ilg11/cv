"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Wand2,
  Check,
  Plus,
  Loader2,
  ArrowRight,
  Briefcase,
  Layers,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

const POPULAR_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Engineer",
  "Product Manager",
  "Data Scientist / Analyst",
  "DevOps & Cloud Engineer",
  "UI/UX Designer",
  "Mobile Developer (iOS/Android)",
  "Digital Marketing Specialist",
];

const SUGGESTED_SKILLS: Record<string, string[]> = {
  "Full Stack Developer": ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Docker", "REST APIs", "Tailwind CSS"],
  "Frontend Developer": ["React", "TypeScript", "Next.js", "JavaScript", "HTML5/CSS3", "Tailwind CSS", "Redux", "Jest"],
  "Backend Engineer": ["Node.js", "Python", "Go", "PostgreSQL", "Redis", "Docker", "Microservices", "AWS"],
  "Product Manager": ["Product Roadmap", "User Research", "Agile / Scrum", "Data Analytics", "A/B Testing", "Jira", "SQL"],
  "Data Scientist / Analyst": ["Python", "SQL", "Machine Learning", "Pandas", "Tableau", "Power BI", "Statistics", "R"],
  "DevOps & Cloud Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "GitHub Actions", "Prometheus"],
  "UI/UX Designer": ["Figma", "User Journey", "Wireframing", "Design Systems", "Prototyping", "Usability Testing"],
};

export function GuidedBuilderDialog({ triggerText = "Sihirli Hızlı CV Oluşturucu" }: { triggerText?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [role, setRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"junior" | "mid" | "senior" | "lead">("mid");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Tailwind CSS",
  ]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [template, setTemplate] = useState<"classic" | "modern" | "compact">("modern");
  const [loading, setLoading] = useState(false);

  const activeRole = customRole.trim() || role;

  const handleSelectRole = (r: string) => {
    setRole(r);
    setCustomRole("");
    if (SUGGESTED_SKILLS[r]) {
      setSelectedSkills(SUGGESTED_SKILLS[r]);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills((prev) => [...prev, customSkillInput.trim()]);
      setCustomSkillInput("");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    toast.info("Claude 3.5 Haiku seçtiğiniz role özel ATS uyumlu profesyonel CV taslağını üretiyor...");

    try {
      const res = await fetch("/api/ai/generate-starter-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          experienceLevel,
          skills: selectedSkills,
          template,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Özgeçmiş oluşturulamadı");

      toast.success(`"${data.title}" başarıyla oluşturuldu! Düzenleyici açılıyor...`);
      setOpen(false);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Özgeçmiş üretilirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 gap-2 text-xs font-semibold">
          <Wand2 className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-white text-lg">Sihirli Hızlı CV Oluşturucu</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs">
            Hedef pozisyonunuzu ve seviyenizi seçin; yapay zeka sektör standartlarında, ölçülebilir XYZ maddeleriyle dolu hazır bir ATS özgeçmişi oluştursun.
          </DialogDescription>
        </DialogHeader>

        {/* Multi-step Content */}
        <div className="py-4 space-y-5">
          {/* Step 1: Role Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" /> 1. Hedef Pozisyon & Rol
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    role === r && !customRole
                      ? "border-indigo-500 bg-indigo-950/60 text-white shadow-sm shadow-indigo-500/20"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="pt-1">
              <Input
                placeholder="Veya farklı bir unvan yazın (örn: Siber Güvenlik Uzmanı, Finans Direktörü)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>

          {/* Step 2: Experience Level & Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> 2. Deneyim Düzeyi
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "junior", label: "Junior (0-2 Yıl)" },
                  { id: "mid", label: "Mid-Level (2-5 Yıl)" },
                  { id: "senior", label: "Senior (5+ Yıl)" },
                  { id: "lead", label: "Lead / Yönetici" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id as any)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                      experienceLevel === lvl.id
                        ? "border-emerald-500 bg-emerald-950/50 text-emerald-300"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-purple-400" /> 3. ATS Şablon Yapısı
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["classic", "modern", "compact"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium uppercase transition-all text-center ${
                      template === t
                        ? "border-purple-500 bg-purple-950/50 text-purple-300"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Skills to Highlight */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <Label className="text-xs font-medium text-slate-300">
              4. Öne Çıkarılacak Beceriler (Tıklayarak Seçin veya Ekleyin)
            </Label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 rounded-lg bg-slate-950/40 border border-slate-800/60">
              {(SUGGESTED_SKILLS[role] || SUGGESTED_SKILLS["Full Stack Developer"]).map((sk) => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {sk}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Özel yetenek ekle..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                className="bg-slate-950 border-slate-800 text-white text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomSkill}
                className="border-slate-700 text-xs h-8 px-3 shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white"
          >
            İptal
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !activeRole}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs shadow-lg shadow-indigo-600/30 px-5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Yapay Zeka Yazıyor..." : "ATS CV'mi Oluştur & Düzenle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
