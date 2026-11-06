import "server-only";
import { ApifyClient } from "apify-client";
import { getClaudeClient } from "@/lib/server/claude";
import { ResumeContent, ResumeContentSchema, defaultResumeContent } from "@/lib/resume/schema";

export interface ProfileBenchmarkResult {
  fullName: string;
  headline: string;
  summary: string;
  skills: string[];
  experienceHighlights: Array<{
    company: string;
    title: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
  }>;
  rawUrl: string;
}

export async function scrapeAndNormalizeLinkedIn(linkedinUrl: string): Promise<ResumeContent> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  const client = new ApifyClient({ token });

  let rawData: any = null;
  try {
    const run = await client.actor("dev_fusion/linkedin-profile-scraper").call(
      {
        profileUrls: [linkedinUrl],
      },
      { waitSecs: 60 }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (items && items.length > 0) {
      rawData = items[0];
    }
  } catch (actorError: any) {
    const msg = actorError.message || "";
    if (msg.includes("approvePermissions") || msg.includes("requires full access")) {
      throw new Error(
        "Apify İzin Onayı Gerekli: dev_fusion/linkedin-profile-scraper actor'ü için Apify hesabınızda izin onayı vermelisiniz. Lütfen şu bağlantıya tıklayarak onaylayın: https://console.apify.com/actors/2SyF0bVxmgGr8IVCZ?approvePermissions=true"
      );
    }
    console.warn("Apify actor call encountered an issue:", msg);
    throw new Error(`LinkedIn profil tarayıcısı hatası: ${msg}`);
  }

  // Use Claude to normalize raw scraped data to ResumeContent schema
  let textContent = "";
  try {
    const claude = getClaudeClient();
    const prompt = `You are a resume data normalization assistant.
Convert this raw LinkedIn profile data into strict JSON matching the target resume schema.
Extract all work history, education, skills, and summary.
Follow the Google XYZ formula for bullet points: "Accomplished [X] as measured by [Y] by doing [Z]".
Never invent false details.

Target Schema structure:
{
  "basics": { "fullName": "", "headline": "", "email": "", "phone": "", "location": "", "website": "", "linkedinUrl": "${linkedinUrl}", "summary": "" },
  "experience": [{ "id": "exp-1", "company": "", "title": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM" or null, "isCurrent": false, "bullets": [""] }],
  "education": [{ "id": "edu-1", "school": "", "degree": "", "field": "", "startDate": "YYYY", "endDate": "YYYY", "details": "" }],
  "skills": [{ "id": "sk-1", "group": "Technical Skills", "items": [""] }],
  "projects": [],
  "certifications": [],
  "languages": []
}

Raw profile data:
${JSON.stringify(rawData || { url: linkedinUrl }).slice(0, 15000)}

Return ONLY valid JSON without markdown formatting or conversational commentary.`;

    const response = await claude.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    textContent = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("");
  } catch (claudeErr: any) {
    console.warn("Claude normalization unavailable, using basic extraction:", claudeErr.message);
  }

  try {
    const cleaned = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const valid = ResumeContentSchema.safeParse(parsed);
    if (valid.success) {
      return valid.data;
    }
  } catch (parseErr) {
    console.error("Failed to parse Claude output:", parseErr);
  }

  return {
    ...defaultResumeContent,
    basics: {
      ...defaultResumeContent.basics,
      linkedinUrl,
    },
  };
}

export async function benchmarkLinkedInProfile(linkedinUrl: string): Promise<ProfileBenchmarkResult> {
  const content = await scrapeAndNormalizeLinkedIn(linkedinUrl);

  return {
    fullName: content.basics.fullName || "LinkedIn Profili",
    headline: content.basics.headline || "Profesyonel",
    summary: content.basics.summary || "",
    skills: content.skills.flatMap((s) => s.items),
    experienceHighlights: content.experience.map((e) => ({
      company: e.company,
      title: e.title,
      duration: `${e.startDate} - ${e.endDate || "Devam Ediyor"}`,
      bullets: e.bullets,
    })),
    education: content.education.map((ed) => ({
      school: ed.school,
      degree: ed.degree,
      field: ed.field,
    })),
    rawUrl: linkedinUrl,
  };
}
