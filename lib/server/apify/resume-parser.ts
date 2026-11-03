import "server-only";
import { ApifyClient } from "apify-client";
import { getClaudeClient } from "@/lib/server/claude";
import { ResumeContent, ResumeContentSchema, defaultResumeContent } from "@/lib/resume/schema";

export async function parseResumePdf(pdfBase64OrText: string, fileName?: string): Promise<ResumeContent> {
  const token = process.env.APIFY_API_TOKEN;
  const claude = getClaudeClient();

  let extractedData: any = null;

  // 1. If Apify token exists, attempt calling vivid_astronaut/resume-parser
  if (token) {
    try {
      const client = new ApifyClient({ token });
      const run = await client.actor("vivid_astronaut/resume-parser").call(
        {
          file: pdfBase64OrText,
          fileName: fileName || "resume.pdf",
        },
        { waitSecs: 45 }
      );

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      if (items && items.length > 0) {
        extractedData = items[0];
      }
    } catch (actorErr: any) {
      console.warn("Apify resume parser actor call failed or timed out:", actorErr.message);
    }
  }

  // 2. Intelligent structuring with Claude 3.5 Haiku
  const prompt = `You are a resume parsing and structuring specialist.
Extract all personal info, work experience, education, and skills from the provided text/data.
Structure it STRICTLY according to this JSON schema:

{
  "basics": {
    "fullName": "Candidate Full Name",
    "headline": "Professional Title / Headline",
    "email": "email address",
    "phone": "phone number",
    "location": "City, Country or State",
    "website": "portfolio or website",
    "linkedinUrl": "linkedin profile url",
    "summary": "Professional summary or objective"
  },
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, Country",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null",
      "isCurrent": false,
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "University / School",
      "degree": "Degree",
      "field": "Major / Field of Study",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "details": "Honors or GPA"
    }
  ],
  "skills": [
    {
      "id": "sk-1",
      "group": "Technical Skills",
      "items": ["Skill 1", "Skill 2"]
    }
  ],
  "projects": [],
  "certifications": [],
  "languages": []
}

Rules:
- Never fabricate dates, companies, or facts.
- Leave missing values as empty strings or empty arrays.
- Return ONLY the valid JSON object. No markdown, no commentary.

Resume Data:
${JSON.stringify(extractedData || pdfBase64OrText).slice(0, 12000)}`;

  try {
    const response = await claude.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("");

    const cleaned = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const valid = ResumeContentSchema.safeParse(parsed);
    if (valid.success) {
      return valid.data;
    }
  } catch (err) {
    console.error("Resume parse structuring failed:", err);
  }

  return defaultResumeContent;
}
