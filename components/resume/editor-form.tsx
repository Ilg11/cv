"use client";

import { useState } from "react";
import { ResumeContent, ExperienceItem, EducationItem, SkillGroup } from "@/lib/resume/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";

export function EditorForm({
  content,
  onChange,
}: {
  content: ResumeContent;
  onChange: (updated: ResumeContent) => void;
}) {
  const updateBasics = (field: string, value: string) => {
    onChange({
      ...content,
      basics: {
        ...content.basics,
        [field]: value,
      },
    });
  };

  // Experience handlers
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

  // Skills handlers
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
      items: ["React", "TypeScript", "Node.js"],
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

  return (
    <div className="space-y-6 pb-20">
      {/* Basics Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs">Full Name</Label>
              <Input
                id="fullName"
                value={content.basics.fullName || ""}
                onChange={(e) => updateBasics("fullName", e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline" className="text-xs">Professional Headline</Label>
              <Input
                id="headline"
                value={content.basics.headline || ""}
                onChange={(e) => updateBasics("headline", e.target.value)}
                placeholder="Senior Product Designer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={content.basics.email || ""}
                onChange={(e) => updateBasics("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={content.basics.phone || ""}
                onChange={(e) => updateBasics("phone", e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs">Location</Label>
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
              <Label htmlFor="linkedinUrl" className="text-xs">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={content.basics.linkedinUrl || ""}
                onChange={(e) => updateBasics("linkedinUrl", e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">Portfolio / Website</Label>
              <Input
                id="website"
                value={content.basics.website || ""}
                onChange={(e) => updateBasics("website", e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary" className="text-xs">Professional Summary</Label>
            <Textarea
              id="summary"
              rows={3}
              value={content.basics.summary || ""}
              onChange={(e) => updateBasics("summary", e.target.value)}
              placeholder="A brief executive summary of your career achievements..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900">Work Experience</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Position
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.experience.map((exp) => (
            <div key={exp.id} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">
                  {exp.title || "Job Title"} at {exp.company || "Company"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-700"
                  onClick={() => removeExperience(exp.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    placeholder="e.g. TechCorp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    placeholder="YYYY-MM"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input
                    value={exp.endDate || ""}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    placeholder="YYYY-MM (or blank if Current)"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    placeholder="e.g. New York, NY"
                  />
                </div>
              </div>

              {/* Bullet points */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Achievement Bullets</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBullet(exp.id)}
                    className="h-6 text-[11px] gap-1 text-primary"
                  >
                    <Plus className="h-3 w-3" /> Add Bullet
                  </Button>
                </div>
                {exp.bullets.map((b, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Textarea
                      rows={2}
                      value={b}
                      onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                      placeholder="Achieved X by doing Y, resulting in Z% improvement..."
                      className="text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-slate-400 hover:text-rose-500"
                      onClick={() => removeBullet(exp.id, idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900">Skills & Competencies</CardTitle>
          <Button variant="outline" size="sm" onClick={addSkillGroup} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Skill Group
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.skills.map((sk) => (
            <div key={sk.id} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/40">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Label className="text-xs">Category</Label>
                  <Input
                    value={sk.group}
                    onChange={(e) => updateSkillGroup(sk.id, e.target.value, sk.items.join(", "))}
                    placeholder="Category"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Skills (comma separated)</Label>
                  <Input
                    value={sk.items.join(", ")}
                    onChange={(e) => updateSkillGroup(sk.id, sk.group, e.target.value)}
                    placeholder="React, TypeScript, GraphQL..."
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mt-5 text-slate-400 hover:text-rose-500"
                  onClick={() => removeSkillGroup(sk.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
