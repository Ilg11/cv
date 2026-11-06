import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/server/claude";
import { ResumeContentSchema, defaultResumeContent } from "@/lib/resume/schema";
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
    const { role, experienceLevel, skills, template = "modern", customNote } = await request.json();

    if (!role || role.trim().length < 2) {
      return NextResponse.json(
        { error: "Lütfen bir hedef pozisyon/rol belirtin (örn: Full Stack Developer)." },
        { status: 400 }
      );
    }

    const claude = getClaudeClient();

    const prompt = `You are a world-class professional career coach and ATS resume optimizer.
Create a complete, highly compelling, ATS-optimized resume for a candidate in the role: "${role}".
Experience Level: "${experienceLevel || "Mid-Level"}" (Years: ${
      experienceLevel === "junior" ? "1-2 years" : experienceLevel === "senior" ? "6+ years" : experienceLevel === "lead" ? "8+ years" : "3-5 years"
    }).
Key Skills to Highlight: ${Array.isArray(skills) && skills.length > 0 ? skills.join(", ") : "Standard industry technologies"}.
${customNote ? `Additional Focus: ${customNote}` : ""}

Rules:
1. Every experience bullet point MUST follow the Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]" with realistic metrics (%, $, latency, throughput, users).
2. Never leave placeholder brackets like "[X]". Provide realistic, believable names and numbers.
3. Include 2-3 work experience entries matching the experience level.
4. Include 1-2 education entries.
5. Include 2-3 skill groups with 5-8 relevant skills each.
6. Return ONLY valid JSON matching this schema:
{
  "basics": {
    "fullName": "Candidate Name",
    "headline": "${role}",
    "email": "${user.email || "candidate@example.com"}",
    "phone": "+90 555 123 4567",
    "location": "Istanbul, Turkey / Remote",
    "website": "https://portfolio.dev",
    "linkedinUrl": "https://linkedin.com/in/profile",
    "summary": "Compelling 2-3 sentence executive summary tailored for ${role}."
  },
  "experience": [
    {
      "id": "exp-1",
      "company": "Tech Innovations Inc.",
      "title": "${role}",
      "location": "Remote",
      "startDate": "2022-01",
      "endDate": null,
      "isCurrent": true,
      "bullets": [
        "Led deployment of...",
        "Increased system throughput by 34% through..."
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "Bogazici University / Tech University",
      "degree": "Bachelor of Science",
      "field": "Computer Engineering / Related Field",
      "startDate": "2016",
      "endDate": "2020",
      "details": "Graduated with honors"
    }
  ],
  "skills": [
    {
      "id": "sk-1",
      "group": "Primary Technologies",
      "items": ["Tech1", "Tech2"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Cloud Scale Platform",
      "url": "https://github.com/project",
      "description": "High throughput microservices architecture",
      "bullets": ["Engineered distributed messaging system handling 500K daily events"]
    }
  ],
  "certifications": [],
  "languages": [
    { "id": "lang-1", "name": "Turkish", "level": "Native" },
    { "id": "lang-2", "name": "English", "level": "Professional Working" }
  ]
}

Return ONLY the raw JSON object, without markdown \`\`\`json tags.`;

    const response = await claude.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("");

    let resumeContent = defaultResumeContent;
    try {
      const cleaned = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const valid = ResumeContentSchema.safeParse(parsed);
      if (valid.success) {
        resumeContent = valid.data;
      }
    } catch (parseErr) {
      console.warn("Claude output parse fallback:", parseErr);
    }

    const title = `${role} (${experienceLevel ? experienceLevel.toUpperCase() : "ATS"}) CV`;

    // Save to database
    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        template: template || "modern",
        source: "scratch",
        content: resumeContent,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record usage
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "ai_optimize",
    });

    return NextResponse.json({ success: true, id: resume.id, title });
  } catch (err: any) {
    console.error("Starter resume generation error:", err);
    return NextResponse.json(
      { error: err.message || "Özgeçmiş üretilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
