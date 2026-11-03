import { createClient } from "@/lib/supabase/server";
import { scrapeAndNormalizeLinkedIn } from "@/lib/server/apify/linkedin-profile";
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
    const { linkedinUrl, title } = await request.json();

    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com/in/")) {
      return NextResponse.json(
        { error: "A valid LinkedIn profile URL is required" },
        { status: 400 }
      );
    }

    const content = await scrapeAndNormalizeLinkedIn(linkedinUrl);

    // Save as new resume in Supabase
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title || `${content.basics.fullName || "Imported"} Resume`,
        source: "linkedin",
        template: "modern",
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}
