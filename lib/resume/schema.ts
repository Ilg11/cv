import { z } from "zod";

export const BasicsSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedinUrl: z.string().default(""),
  summary: z.string().default(""),
});

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  title: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().nullable().default(null),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  school: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default(""),
});

export const SkillGroupSchema = z.object({
  id: z.string(),
  group: z.string().default("Skills"),
  items: z.array(z.string()).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  url: z.string().default(""),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
});

export const LanguageItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  level: z.string().default(""),
});

export const ResumeContentSchema = z.object({
  basics: BasicsSchema.default({}),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  skills: z.array(SkillGroupSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  languages: z.array(LanguageItemSchema).default([]),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

export const defaultResumeContent: ResumeContent = {
  basics: {
    fullName: "Alex Morgan",
    headline: "Senior Software Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedinUrl: "https://linkedin.com/in/alexmorgan",
    summary:
      "Results-oriented Senior Software Engineer with 7+ years of experience leading cross-functional teams and building high-performance web applications. Specialized in scalable distributed systems and cloud architecture.",
  },
  experience: [
    {
      id: "exp-1",
      company: "TechCorp Global",
      title: "Senior Full-Stack Engineer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      endDate: null,
      isCurrent: true,
      bullets: [
        "Architected and deployed a multi-tenant SaaS microservices platform handling over 2M daily requests with 99.98% uptime.",
        "Reduced API response latency by 42% through query optimization, Redis distributed caching, and connection pooling.",
        "Mentored a team of 6 engineers, spearheading standard code review guidelines and CI/CD automated deployment pipelines.",
      ],
    },
    {
      id: "exp-2",
      company: "Innovate Labs",
      title: "Software Engineer",
      location: "Austin, TX",
      startDate: "2018-06",
      endDate: "2021-02",
      isCurrent: false,
      bullets: [
        "Engineered real-time data ingestion pipelines using TypeScript, Next.js, and PostgreSQL for financial analytics.",
        "Collaborated with product designers to implement responsive, accessible design systems reaching 150K+ monthly active users.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-05",
      details: "Graduated with Honors. Dean's Honor List.",
    },
  ],
  skills: [
    {
      id: "sk-1",
      group: "Languages & Frameworks",
      items: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "SQL"],
    },
    {
      id: "sk-2",
      group: "Databases & Cloud",
      items: ["PostgreSQL", "Supabase", "Redis", "AWS", "Docker", "Git", "REST APIs"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "CloudMetrics Analytics Platform",
      url: "https://github.com/alexmorgan/cloudmetrics",
      description: "Open-source developer dashboard for real-time latency monitoring.",
      bullets: [
        "Built with Next.js App Router and Tailwind CSS, achieving over 1,200 GitHub stars.",
        "Integrated WebSockets for live telemetry telemetry graphs and automated alerting.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      date: "2023-08",
    },
  ],
  languages: [
    {
      id: "lang-1",
      name: "English",
      level: "Native / Bilingual",
    },
  ],
};
