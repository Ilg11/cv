import "server-only";
import { ApifyClient } from "apify-client";
import { getClaudeClient } from "@/lib/server/claude";
import { ResumeContent, ResumeContentSchema, defaultResumeContent } from "@/lib/resume/schema";

export async function scrapeAndNormalizeLinkedIn(linkedinUrl: string): Promise<ResumeContent> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  const client = new ApifyClient({ token });

  // Call LinkedIn profile scraper actor
  let rawData: any = null;
  try {
    const run = await client.actor("dev_fusion/linkedin-profile-scraper").call(
      {
        profileUrls: [linkedinUrl],
      },
      { waitSecs: 60 }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    if (items && items.length > 0) {
      rawData = items[0];
    }
  } catch (actorError: any) {
    console.warn("Apify actor call encountered an issue:", actorError.message);
  }

  // If scraper returned raw data, use Claude to normalize it cleanly to our schema
  const claude = getClaudeClient();

  const prompt = `You are a resume data normalization assistant.
Convert this raw profile data into strict JSON matching the target resume schema.
If a field is missing, use empty strings or empty arrays. Never invent false details.

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
${JSON.stringify(rawData || { url: linkedinUrl })}

Return ONLY the raw JSON object, without markdown formatting or commentary.`;

  const response = await claude.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c as any).text)
    .join("");

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

  // Fallback with user's linkedin URL populated
  return {
    ...defaultResumeContent,
    basics: {
      ...defaultResumeContent.basics,
      linkedinUrl,
    },
  };
}
