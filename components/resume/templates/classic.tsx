import React from "react";
import { ResumeContent } from "@/lib/resume/schema";

export function ClassicTemplate({ content }: { content: ResumeContent }) {
  const { basics, experience, education, skills, projects, certifications, languages } = content;

  return (
    <div className="bg-white text-slate-900 font-serif p-8 max-w-[800px] mx-auto shadow-sm text-[13px] leading-relaxed border border-slate-100">
      {/* Header */}
      <div className="text-center border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">{basics.fullName || "Your Full Name"}</h1>
        {basics.headline && <p className="text-sm italic text-slate-700 mt-1">{basics.headline}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-sans">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-normal">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 font-sans">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-sans text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                    <span className="text-slate-600"> — {exp.company}</span>
                    {exp.location && <span className="text-slate-500 text-[11px]"> ({exp.location})</span>}
                  </div>
                  <span className="text-slate-500 text-[11px] font-medium">
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-slate-700">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 font-sans">
            Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="font-sans text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{proj.name}</span>
                  {proj.url && <span className="text-primary text-[11px]">{proj.url}</span>}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 font-sans">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline font-sans text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{edu.degree} in {edu.field}</span>
                  <div className="text-slate-600 font-serif italic">{edu.school}</div>
                  {edu.details && <p className="text-slate-500 text-[11px] mt-0.5">{edu.details}</p>}
                </div>
                <span className="text-slate-500 text-[11px]">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
            Skills
          </h2>
          <div className="space-y-1.5 text-xs font-sans">
            {skills.map((grp) => (
              <div key={grp.id} className="flex gap-2">
                <span className="font-semibold text-slate-900 min-w-[120px]">{grp.group}:</span>
                <span className="text-slate-700">{grp.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
