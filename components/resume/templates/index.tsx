import React from "react";
import { ResumeContent } from "@/lib/resume/schema";
import { ClassicTemplate } from "./classic";
import { ModernTemplate } from "./modern";
import { CompactTemplate } from "./compact";

export function ResumeRenderer({
  template,
  content,
}: {
  template: string;
  content: ResumeContent;
}) {
  switch (template) {
    case "modern":
      return <ModernTemplate content={content} />;
    case "compact":
      return <CompactTemplate content={content} />;
    case "classic":
    default:
      return <ClassicTemplate content={content} />;
  }
}
