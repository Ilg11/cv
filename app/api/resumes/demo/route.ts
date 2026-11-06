import { createClient } from "@/lib/supabase/server";
import { defaultResumeContent } from "@/lib/resume/schema";
import { generateSlug } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Insert sample resume
    const { data: resume, error: resumeErr } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: "Senior Full-Stack Engineer (Örnek ATS CV)",
        template: "modern",
        source: "scratch",
        content: defaultResumeContent,
      })
      .select()
      .single();

    if (resumeErr) throw resumeErr;

    // 2. Insert sample shared link
    const slug = generateSlug("alex-morgan");
    await supabase.from("shared_links").insert({
      resume_id: resume.id,
      user_id: user.id,
      slug,
      company_name: "Google (Örnek Başvuru)",
      is_active: true,
      view_count: 4,
    });

    // 3. Insert sample job analysis
    await supabase.from("job_analyses").insert({
      user_id: user.id,
      resume_id: resume.id,
      job_url: "https://www.linkedin.com/jobs/view/stripe-staff-engineer",
      job_title: "Staff Software Engineer",
      job_company: "Stripe",
      job_description:
        "Stripe is looking for a Staff Software Engineer to design, build, and scale global financial infrastructure. Requirements: 6+ years in distributed systems, PostgreSQL, Redis, Kubernetes, high availability microservices, and GraphQL APIs.",
      ats_score: 88,
      missing_keywords: ["Kubernetes", "GraphQL", "Distributed Tracing"],
      optimized_content: {
        score: 88,
        jobTitle: "Staff Software Engineer",
        company: "Stripe",
        summaryFeedback:
          "Strong match with 88% keyword alignment. Highlight Kubernetes orchestration and GraphQL API experience to maximize ATS pass rate.",
        keywords: {
          matched: ["Distributed Systems", "PostgreSQL", "Redis", "Microservices", "TypeScript", "Next.js", "Docker"],
          missing: ["Kubernetes", "GraphQL", "Distributed Tracing"],
        },
        suggestions: [
          {
            id: "sug-demo-1",
            section: "experience",
            targetId: "exp-1",
            type: "action_verb",
            before:
              "Architected and deployed a multi-tenant SaaS microservices platform handling over 2M daily requests with 99.98% uptime.",
            after:
              "Spearheaded and deployed a multi-tenant distributed cloud platform on AWS/Docker handling 2M+ daily requests, sustaining 99.98% SLA uptime.",
            reason: "Uses high-impact leadership verb and reinforces distributed cloud scalability.",
          },
        ],
      },
    });

    return NextResponse.json({ success: true, id: resume.id, resume, slug });
  } catch (err: any) {
    console.error("Demo creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create demo resume" },
      { status: 500 }
    );
  }
}
