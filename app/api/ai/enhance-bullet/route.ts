import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/server/claude";
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
    const { bullet, jobTitle } = await request.json();

    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a bullet point with at least 5 characters." },
        { status: 400 }
      );
    }

    const claude = getClaudeClient();

    const prompt = `You are an elite ATS resume writer and career strategist.
Enhance the following resume bullet point for a candidate${jobTitle ? ` working as "${jobTitle}"` : ""}.

Rules:
1. Start with a powerful, dynamic action verb in the past tense (or present if ongoing).
2. Follow the standard Google/XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".
3. DO NOT invent false company names, imaginary degrees, or completely ungrounded facts.
4. Improve clarity, impact, and ATS keyword visibility.
5. Keep it concise (1-2 sentences maximum, typical resume bullet length).

Original Bullet:
"${bullet.trim()}"

Return ONLY the single enhanced bullet point text. Do not wrap in quotes, do not add introductory text or conversational commentary.`;

    const response = await claude.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("")
      .trim();

    return NextResponse.json({
      enhancedBullet: textContent,
    });
  } catch (err: any) {
    console.error("Enhance bullet error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to enhance bullet" },
      { status: 500 }
    );
  }
}
