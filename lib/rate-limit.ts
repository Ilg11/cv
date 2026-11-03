import "server-only";
import { createAdminClient } from "@/lib/server/supabase-admin";

export type RateLimitKind =
  | "linkedin_import"
  | "pdf_parse"
  | "job_scrape"
  | "ai_optimize"
  | "pdf_export";

const LIMITS: Record<RateLimitKind, number> = {
  linkedin_import: 5,   // max 5 LinkedIn imports per 24 hours
  pdf_parse: 10,        // max 10 PDF parses per 24 hours
  job_scrape: 20,       // max 20 job link scrapes per 24 hours
  ai_optimize: 25,      // max 25 AI ATS analyses per 24 hours
  pdf_export: 50,       // max 50 PDF exports per 24 hours
};

export async function checkRateLimit(
  userId: string,
  kind: RateLimitKind
): Promise<{ allowed: boolean; currentCount: number; maxLimit: number }> {
  const admin = createAdminClient();
  const maxLimit = LIMITS[kind] || 20;

  // Window: last 24 hours
  const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await admin
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", past24Hours);

  if (error) {
    console.warn("Failed to check rate limit in usage_events:", error.message);
    return { allowed: true, currentCount: 0, maxLimit };
  }

  const currentCount = count || 0;
  return {
    allowed: currentCount < maxLimit,
    currentCount,
    maxLimit,
  };
}
