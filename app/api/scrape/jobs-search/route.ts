import { createClient } from "@/lib/supabase/server";
import { searchLinkedInJobs } from "@/lib/server/apify/linkedin-job";
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
    const { keywords, location, limit } = await request.json();

    if (!keywords || keywords.trim().length < 2) {
      return NextResponse.json(
        { error: "Lütfen aranacak bir pozisyon veya teknoloji konusu girin (örn: React Developer, Product Manager)." },
        { status: 400 }
      );
    }

    const jobs = await searchLinkedInJobs(
      keywords.trim(),
      location || "Remote",
      limit || 8
    );

    // Record usage
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "job_scrape",
    });

    return NextResponse.json({ success: true, count: jobs.length, jobs });
  } catch (err: any) {
    console.error("Job search API error:", err);
    return NextResponse.json(
      { error: err.message || "LinkedIn ilanları Apify ile taranırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
