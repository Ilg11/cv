import React from "react";
import { ResumeContent } from "@/lib/resume/schema";

export function CompactTemplate({ content }: { content: ResumeContent }) {
  const { basics, experience, education, skills, projects, certifications, languages } = content;

  return (
    <div className="bg-white text-slate-900 font-sans p-6 max-w-[800px] mx-auto shadow-sm text-[12px] leading-snug border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-900 pb-2 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900">{basics.fullName || "Your Full Name"}</h1>
          {basics.headline && <p className="text-xs font-semibold text-slate-600">{basics.headline}</p>}
        </div>
        <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-500 mt-1 sm:mt-0">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>| {basics.phone}</span>}
          {basics.location && <span>| {basics.location}</span>}
          {basics.linkedinUrl && <span>| LinkedIn</span>}
        </div>
      </div>

      {/* Summary */}
      {basics.summary && (
        <section className="mb-3">
          <p className="text-slate-700">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-medium text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{exp.title}</span>, {exp.company}
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 mt-0.5 space-y-0.5 text-slate-600">
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

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree} in {edu.field}</span> — {edu.school}
                </div>
                <span className="text-slate-500 text-[10px]">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((grp) => (
              <div key={grp.id} className="flex gap-1.5">
                <span className="font-semibold text-slate-900">{grp.group}:</span>
                <span className="text-slate-600">{grp.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
