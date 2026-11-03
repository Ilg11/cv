import { createClient } from "@/lib/supabase/server";
import { scrapeLinkedInJob } from "@/lib/server/apify/linkedin-job";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobUrl } = await request.json();

    if (!jobUrl || !jobUrl.includes("linkedin.com")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn job URL (e.g. https://www.linkedin.com/jobs/view/...)" },
        { status: 400 }
      );
    }

    const jobData = await scrapeLinkedInJob(jobUrl);

    // Record usage event in Supabase
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "job_scrape",
    });

    return NextResponse.json(jobData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to scrape job with Apify" },
      { status: 500 }
    );
  }
}
