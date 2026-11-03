"use client";

import { useState } from "react";
import {
  ResumeContent,
  ExperienceItem,
  EducationItem,
  SkillGroup,
  ProjectItem,
  CertificationItem,
  LanguageItem,
} from "@/lib/resume/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Loader2,
  Wand2,
  GraduationCap,
  Briefcase,
  Layers,
  FolderGit2,
  Award,
  Languages,
} from "lucide-react";
import { toast } from "sonner";

export function EditorForm({
  content,
  onChange,
}: {
  content: ResumeContent;
  onChange: (updated: ResumeContent) => void;
}) {
  const [enhancingBulletKey, setEnhancingBulletKey] = useState<string | null>(null);

  const updateBasics = (field: string, value: string) => {
    onChange({
      ...content,
      basics: {
        ...content.basics,
        [field]: value,
      },
    });
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: null,
      isCurrent: true,
      bullets: [""],
    };
    onChange({
      ...content,
      experience: [newExp, ...content.experience],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onChange({
      ...content,
      experience: content.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...content,
      experience: content.experience.filter((exp) => exp.id !== id),
    });
  };

  const moveExperience = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= content.experience.length) return;
    const reordered = [...content.experience];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    onChange({ ...content, experience: reordered });
  };

  const updateBullet = (expId: string, bulletIdx: number, text: string) => {
    onChange({
      ...content,
      experience: content.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = text;
        return { ...exp, bullets: newBullets };
      }),
    });
  };

  const addBullet = (expId: string) => {
    onChange({
      ...content,
      experience: content.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: [...exp.bullets, ""] };
      }),
    });
  };

  const removeBullet = (expId: string, bulletIdx: number) => {
    onChange({
      ...content,
      experience: content.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx),
        };
      }),
    });
  };

  // AI Bullet Point Enhancer
  const handleEnhanceBullet = async (expId: string, bulletIdx: number, originalBullet: string, jobTitle: string) => {
    if (!originalBullet || originalBullet.trim().length < 5) {
      toast.error("Type a short draft bullet first before enhancing.");
      return;
    }

    const key = `${expId}-${bulletIdx}`;
    setEnhancingBulletKey(key);
    toast.info("Claude 3.5 is enhancing this bullet with impactful ATS action verbs...");

    try {
      const res = await fetch("/api/ai/enhance-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: originalBullet, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enhance");

      updateBullet(expId, bulletIdx, data.enhancedBullet);
      toast.success("Bullet point enhanced with strong ATS metrics!");
    } catch (err: any) {
      toast.error(err.message || "Failed to enhance bullet.");
    } finally {
      setEnhancingBulletKey(null);
    }
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      details: "",
    };
    onChange({
      ...content,
      education: [...(content.education || []), newEdu],
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...content,
      education: (content.education || []).map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...content,
      education: (content.education || []).filter((edu) => edu.id !== id),
    });
  };

  // --- Skills Handlers ---
  const updateSkillGroup = (id: string, groupName: string, itemsStr: string) => {
    const items = itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
    onChange({
      ...content,
      skills: content.skills.map((sk) =>
        sk.id === id ? { ...sk, group: groupName, items } : sk
      ),
    });
  };

  const addSkillGroup = () => {
    const newSkill: SkillGroup = {
      id: `sk-${Date.now()}`,
      group: "Technologies",
      items: ["TypeScript", "React", "Next.js"],
    };
    onChange({
      ...content,
      skills: [...content.skills, newSkill],
    });
  };

  const removeSkillGroup = (id: string) => {
    onChange({
      ...content,
      skills: content.skills.filter((sk) => sk.id !== id),
    });
  };

  // --- Projects Handlers ---
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "",
      url: "",
      description: "",
      bullets: [],
    };
    onChange({
      ...content,
      projects: [...(content.projects || []), newProj],
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    onChange({
      ...content,
      projects: (content.projects || []).map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...content,
      projects: (content.projects || []).filter((p) => p.id !== id),
    });
  };

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      {/* Basics Section */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">Full Name</Label>
              <Input
                id="fullName"
                value={content.basics.fullName || ""}
                onChange={(e) => updateBasics("fullName", e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline" className="text-xs font-semibold text-slate-700">Headline / Role</Label>
              <Input
                id="headline"
                value={content.basics.headline || ""}
                onChange={(e) => updateBasics("headline", e.target.value)}
                placeholder="Senior Full Stack Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={content.basics.email || ""}
                onChange={(e) => updateBasics("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone</Label>
              <Input
                id="phone"
                value={content.basics.phone || ""}
                onChange={(e) => updateBasics("phone", e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold text-slate-700">Location</Label>
              <Input
                id="location"
                value={content.basics.location || ""}
                onChange={(e) => updateBasics("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-slate-700">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={content.basics.linkedinUrl || ""}
                onChange={(e) => updateBasics("linkedinUrl", e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold text-slate-700">Website / Portfolio</Label>
              <Input
                id="website"
                value={content.basics.website || ""}
                onChange={(e) => updateBasics("website", e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary" className="text-xs font-semibold text-slate-700">Executive Summary</Label>
            <Textarea
              id="summary"
              rows={3}
              value={content.basics.summary || ""}
              onChange={(e) => updateBasics("summary", e.target.value)}
              placeholder="High-impact career summary emphasizing leadership and key results..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-600" />
            <span>Work Experience</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Position
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {content.experience.map((exp, idx) => (
            <div key={exp.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">
                  {exp.title || "Job Title"} {exp.company && `at ${exp.company}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700"
                    onClick={() => moveExperience(idx, "up")}
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700"
                    onClick={() => moveExperience(idx, "down")}
                    disabled={idx === content.experience.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500 hover:text-rose-700 ml-1"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Start Date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    placeholder="YYYY-MM"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">End Date (Blank if Present)</Label>
                  <Input
                    value={exp.endDate || ""}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    placeholder="YYYY-MM"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs text-slate-600">Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              {/* Bullets with AI Enhancer Wand */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Key Achievements & Responsibilities</span>
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBullet(exp.id)}
                    className="h-6 text-[11px] gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="h-3 w-3" /> Add Bullet
                  </Button>
                </div>

                {exp.bullets.map((b, bulletIdx) => {
                  const isEnhancing = enhancingBulletKey === `${exp.id}-${bulletIdx}`;
                  return (
                    <div key={bulletIdx} className="flex gap-2 items-start">
                      <Textarea
                        rows={2}
                        value={b}
                        onChange={(e) => updateBullet(exp.id, bulletIdx, e.target.value)}
                        placeholder="Architected X resulting in Y% performance boost..."
                        className="text-xs flex-1"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Enhance with AI (Claude 3.5)"
                          className="h-8 w-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleEnhanceBullet(exp.id, bulletIdx, b, exp.title)}
                          disabled={isEnhancing}
                        >
                          {isEnhancing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-rose-500"
                          onClick={() => removeBullet(exp.id, bulletIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span>Education</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {(content.education || []).map((edu) => (
            <div key={edu.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">
                  {edu.degree || "Degree"} {edu.school && `at ${edu.school}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-700"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Institution / University</Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                    placeholder="e.g. UC Berkeley"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Degree & Major</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Start Year</Label>
                  <Input
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">End Year / Graduation</Label>
                  <Input
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Honors / GPA / Activities</Label>
                <Input
                  value={edu.details || ""}
                  onChange={(e) => updateEducation(edu.id, "details", e.target.value)}
                  placeholder="e.g. Graduated Magna Cum Laude • Dean's List"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-600" />
            <span>Skills & Core Competencies</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addSkillGroup} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Skill Group
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {content.skills.map((sk) => (
            <div key={sk.id} className="rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/70">
              <div className="flex gap-2 items-center">
                <div className="w-1/3">
                  <Label className="text-xs text-slate-600">Category Name</Label>
                  <Input
                    value={sk.group}
                    onChange={(e) => updateSkillGroup(sk.id, e.target.value, sk.items.join(", "))}
                    placeholder="e.g. Backend"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-slate-600">Skills (comma separated)</Label>
                  <Input
                    value={sk.items.join(", ")}
                    onChange={(e) => updateSkillGroup(sk.id, sk.group, e.target.value)}
                    placeholder="Node.js, PostgreSQL, Docker..."
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mt-5 text-slate-400 hover:text-rose-500"
                  onClick={() => removeSkillGroup(sk.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-amber-600" />
            <span>Key Projects & Open Source</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addProject} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {(content.projects || []).map((proj) => (
            <div key={proj.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">
                  {proj.name || "Project Title"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-700"
                  onClick={() => removeProject(proj.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Project Name</Label>
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                    placeholder="e.g. Distributed Analytics Engine"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Project Link / URL</Label>
                  <Input
                    value={proj.url || ""}
                    onChange={(e) => updateProject(proj.id, "url", e.target.value)}
                    placeholder="https://github.com/yourname/project"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Description & Tech Stack</Label>
                <Textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                  placeholder="Engineered high-scale data pipeline using Next.js, Redis, and WebSockets..."
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
