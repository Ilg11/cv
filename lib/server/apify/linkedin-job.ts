import "server-only";
import { ApifyClient } from "apify-client";
import { getClaudeClient } from "@/lib/server/claude";

export interface ScrapedJobData {
  jobTitle: string;
  company: string;
  description: string;
  location?: string;
  jobUrl: string;
}

export async function scrapeLinkedInJob(jobUrl: string): Promise<ScrapedJobData> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  // Strict URL hostname check to avoid SSRF abuse
  try {
    const parsedUrl = new URL(jobUrl);
    if (!parsedUrl.hostname.includes("linkedin.com")) {
      throw new Error("Only linkedin.com job URLs are supported.");
    }
  } catch {
    throw new Error("Invalid LinkedIn job URL provided.");
  }

  const client = new ApifyClient({ token });

  let rawJobData: any = null;

  try {
    // 1. Try Curious Coder LinkedIn Jobs Scraper actor
    const run = await client.actor("curious_coder/linkedin-jobs-scraper").call(
      {
        urls: [jobUrl],
        jobUrls: [jobUrl],
        maxItems: 1,
      },
      { waitSecs: 60 }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    if (items && items.length > 0) {
      rawJobData = items[0];
    }
  } catch (actorErr: any) {
    console.warn("Curious Coder actor call failed, trying fallback:", actorErr.message);
  }

  // If Apify returned structured job data, extract fields
  if (rawJobData) {
    const title = rawJobData.title || rawJobData.jobTitle || rawJobData.position || "";
    const company =
      rawJobData.companyName ||
      rawJobData.company ||
      rawJobData.company_name ||
      "Target Company";
    const description =
      rawJobData.descriptionText ||
      rawJobData.description ||
      rawJobData.jobDescription ||
      "";
    const location = rawJobData.location || rawJobData.jobLocation || "";

    if (description && description.length > 30) {
      return {
        jobTitle: title || "Target Role",
        company: company || "Target Employer",
        description,
        location,
        jobUrl,
      };
    }
  }

  // 2. Fallback: Use Claude to parse any raw HTML or text retrieved
  if (rawJobData && typeof rawJobData === "object") {
    const claude = getClaudeClient();
    const prompt = `Extract the job title, company name, and full job description from this scraped payload.
Return ONLY valid JSON in this structure:
{
  "jobTitle": "...",
  "company": "...",
  "description": "...",
  "location": "..."
}

Payload:
${JSON.stringify(rawJobData).slice(0, 10000)}`;

    try {
      const response = await claude.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content
        .filter((c) => c.type === "text")
        .map((c) => (c as any).text)
        .join("");

      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        jobTitle: parsed.jobTitle || "Target Role",
        company: parsed.company || "Target Company",
        description: parsed.description || "",
        location: parsed.location || "",
        jobUrl,
      };
    } catch (parseErr) {
      console.warn("Claude normalization failed:", parseErr);
    }
  }

  throw new Error(
    "Could not automatically extract job details from this LinkedIn link. Please paste the job description text manually."
  );
}
