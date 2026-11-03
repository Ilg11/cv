import { createClient } from "@/lib/supabase/server";
import { runAtsOptimization } from "@/lib/ai/optimizer";
import { scrapeLinkedInJob } from "@/lib/server/apify/linkedin-job";
import { ResumeContent } from "@/lib/resume/schema";
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
    let { resumeId, jobDescription, jobUrl } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    // If jobDescription is not provided or too short, but jobUrl is provided, scrape with Apify!
    if ((!jobDescription || jobDescription.trim().length < 20) && jobUrl && jobUrl.includes("linkedin.com")) {
      try {
        const scraped = await scrapeLinkedInJob(jobUrl);
        jobDescription = scraped.description;
      } catch (scrapeErr: any) {
        return NextResponse.json(
          { error: `LinkedIn scraping error: ${scrapeErr.message}. Please paste the job description manually.` },
          { status: 400 }
        );
      }
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn job URL or paste the job description text (at least 20 characters)." },
        { status: 400 }
      );
    }

    // Fetch the user's resume
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Run AI ATS optimization
    const analysis = await runAtsOptimization(
      resume.content as ResumeContent,
      jobDescription,
      jobUrl
    );

    // Save to job_analyses table
    await supabase.from("job_analyses").insert({
      user_id: user.id,
      resume_id: resume.id,
      job_url: jobUrl || null,
      job_title: analysis.jobTitle,
      job_company: analysis.company,
      job_description: jobDescription,
      ats_score: analysis.score,
      missing_keywords: analysis.keywords.missing,
      optimized_content: analysis,
    });

    // Record usage event
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "ai_optimize",
    });

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("Optimization error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
