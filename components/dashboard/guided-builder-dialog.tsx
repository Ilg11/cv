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

  // Form State
  const [role, setRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"junior" | "mid" | "senior" | "lead">("mid");
  const [template, setTemplate] = useState<"classic" | "modern" | "compact">("modern");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(SUGGESTED_SKILLS["Full Stack Developer"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customNote, setCustomNote] = useState("");
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
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput("");
    }
  };

  const handleGenerate = async () => {
    if (!activeRole) {
      toast.error("Lütfen bir rol seçin veya özel pozisyon adı girin.");
      return;
    }

    setLoading(true);
    toast.info("Claude 3.5 Haiku sektörünüze özel ATS CV içeriği oluşturuyor...");

    try {
      const res = await fetch("/api/ai/generate-starter-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          experienceLevel,
          template,
          skills: selectedSkills,
          customNote: customNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Özgeçmiş oluşturulamadı");

      toast.success(`"${data.title}" oluşturuldu! Düzenleyici açılıyor...`);
      setOpen(false);
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-9 rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50 gap-1.5 shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>{triggerText}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-slate-900 text-lg">Sihirli Hızlı CV Oluşturucu</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-xs">
            Hedef pozisyonunuzu ve seviyenizi seçin; yapay zeka sektör standartlarında, ölçülebilir XYZ maddeleriyle dolu hazır bir ATS özgeçmişi oluştursun.
          </DialogDescription>
        </DialogHeader>

        {/* Multi-step Content */}
        <div className="py-3 space-y-5">
          {/* Step 1: Role Selection */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-indigo-600" /> 1. Hedef Pozisyon & Rol
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    role === r && !customRole
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="pt-1">
              <Input
                placeholder="Veya farklı bir unvan yazın (örn: Siber Güvenlik Uzmanı)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Step 2: Experience Level & Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" /> 2. Deneyim Düzeyi
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "junior", label: "Junior (0-2 yıl)" },
                  { id: "mid", label: "Mid (2-5 yıl)" },
                  { id: "senior", label: "Senior (5-8 yıl)" },
                  { id: "lead", label: "Lead / Manager" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center ${
                      experienceLevel === lvl.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-indigo-600" /> 3. ATS Şablon Yapısı
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["classic", "modern", "compact"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium uppercase transition-all text-center ${
                      template === t
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Skills to Highlight */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">
              4. Öne Çıkarılacak Beceriler (Tıklayarak Seçin veya Ekleyin)
            </Label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-slate-50 border border-slate-200">
              {(SUGGESTED_SKILLS[role] || SUGGESTED_SKILLS["Full Stack Developer"]).map((sk) => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
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
                className="bg-white border-slate-200 text-slate-900 text-xs h-9 rounded-xl flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomSkill}
                className="border-slate-200 text-xs h-9 px-3 shrink-0 rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            İptal
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !activeRole}
            className="bg-slate-900 hover:bg-slate-800 text-white gap-2 text-xs px-5 rounded-xl shadow-xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            <span>{loading ? "Yapay Zeka Yazıyor..." : "ATS CV'mi Oluştur & Düzenle"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
