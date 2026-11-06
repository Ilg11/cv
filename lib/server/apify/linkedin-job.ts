import "server-only";
import { ApifyClient } from "apify-client";
import { getClaudeClient } from "@/lib/server/claude";

export interface ScrapedJobData {
  jobTitle: string;
  company: string;
  description: string;
  location?: string;
  jobUrl: string;
  companyLogo?: string;
  postedAt?: string;
  seniorityLevel?: string;
  salary?: string;
}

export interface LinkedInJobSearchResult {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  link: string;
  postedAt?: string;
  seniorityLevel?: string;
  salary?: string;
  descriptionText?: string;
}

// 1. Scrape a single LinkedIn Job posting by URL
export async function scrapeLinkedInJob(jobUrl: string): Promise<ScrapedJobData> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

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
    const run = await client.actor("curious_coder/linkedin-jobs-scraper").call(
      {
        urls: [jobUrl],
        maxItems: 1,
      },
      { waitSecs: 60 }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (items && items.length > 0) {
      rawJobData = items[0];
    }
  } catch (actorErr: any) {
    console.warn("Curious Coder actor call failed:", actorErr.message);
  }

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
      rawJobData.descriptionHtml ||
      "";
    const location = rawJobData.location || rawJobData.jobLocation || "";

    if (description && description.length > 20) {
      return {
        jobTitle: title || "Target Role",
        company: company || "Target Employer",
        description,
        location,
        jobUrl,
        companyLogo: rawJobData.companyLogo,
        postedAt: rawJobData.postedAt,
        seniorityLevel: rawJobData.seniorityLevel,
        salary: rawJobData.salary,
      };
    }
  }

  // Fallback: Use Claude to parse if raw payload needs extraction
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
      if (parsed.description) {
        return {
          jobTitle: parsed.jobTitle || "Target Role",
          company: parsed.company || "Target Company",
          description: parsed.description,
          location: parsed.location || "",
          jobUrl,
        };
      }
    } catch (parseErr) {
      console.warn("Claude fallback parse failed:", parseErr);
    }
  }

  throw new Error("Could not extract job description from LinkedIn. Please copy-paste the job description text manually.");
}

// 2. Search LinkedIn Jobs by Topic / Keywords & Location using curious_coder/linkedin-jobs-scraper
export async function searchLinkedInJobs(
  keywords: string,
  location: string = "Remote",
  limit: number = 8
): Promise<LinkedInJobSearchResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  const client = new ApifyClient({ token });

  try {
    const run = await client.actor("curious_coder/linkedin-jobs-scraper").call(
      {
        keywords,
        location: location || "Remote",
        datePosted: "anyTime",
        maxItems: Math.min(limit, 20),
      },
      { waitSecs: 60 }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit });
    if (!items || items.length === 0) {
      return [];
    }

    return items.map((item: any) => ({
      id: item.id || item.refId || Math.random().toString(36).substring(7),
      title: item.title || item.jobTitle || "İsimsiz Pozisyon",
      companyName: item.companyName || item.company || "Şirket Belirtilmemiş",
      companyLogo: item.companyLogo || null,
      location: item.location || location || "Belirtilmemiş",
      link: item.link || item.applyUrl || item.inputUrl || "",
      postedAt: item.postedAt || "Yakın zamanda",
      seniorityLevel: item.seniorityLevel || "Tüm Seviyeler",
      salary: item.salary || null,
      descriptionText: item.descriptionText || item.description || "",
    }));
  } catch (err: any) {
    console.error("LinkedIn Jobs search error via Apify:", err);
    throw new Error(err.message || "Failed to search jobs on LinkedIn with Apify");
  }
}
