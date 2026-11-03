import React from "react";
import { ResumeContent } from "@/lib/resume/schema";

export function ModernTemplate({ content }: { content: ResumeContent }) {
  const { basics, experience, education, skills, projects, certifications, languages } = content;

  return (
    <div className="bg-white text-slate-800 font-sans p-8 max-w-[800px] mx-auto shadow-sm text-[13px] leading-relaxed border border-slate-100">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{basics.fullName || "Your Full Name"}</h1>
        {basics.headline && <p className="text-sm font-medium text-primary mt-0.5">{basics.headline}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
          {basics.website && <span>• {basics.website}</span>}
          {basics.linkedinUrl && <span>• {basics.linkedinUrl}</span>}
        </div>
      </div>

      {/* Summary */}
      {basics.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-2">
            Professional Summary
            <span className="flex-1 h-px bg-slate-200"></span>
          </h2>
          <p className="text-slate-600 leading-normal">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
            Work Experience
            <span className="flex-1 h-px bg-slate-200"></span>
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                    <span className="text-slate-600 font-medium"> | {exp.company}</span>
                    {exp.location && <span className="text-slate-400 text-[11px]"> • {exp.location}</span>}
                  </div>
                  <span className="text-slate-500 text-[11px] font-medium">
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-slate-600 text-xs">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
            Key Projects
            <span className="flex-1 h-px bg-slate-200"></span>
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{proj.name}</span>
                  {proj.url && <span className="text-primary text-[11px] font-medium">{proj.url}</span>}
                </div>
                {proj.description && <p className="text-slate-600 mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
            Education
            <span className="flex-1 h-px bg-slate-200"></span>
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{edu.degree} in {edu.field}</span>
                  <div className="text-slate-600 font-medium">{edu.school}</div>
                  {edu.details && <p className="text-slate-500 text-[11px] mt-0.5">{edu.details}</p>}
                </div>
                <span className="text-slate-500 text-[11px]">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
            Core Competencies
            <span className="flex-1 h-px bg-slate-200"></span>
          </h2>
          <div className="space-y-1.5 text-xs">
            {skills.map((grp) => (
              <div key={grp.id} className="flex gap-2">
                <span className="font-semibold text-slate-800 min-w-[130px]">{grp.group}:</span>
                <span className="text-slate-600">{grp.items.join(" • ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
