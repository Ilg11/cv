import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all user resumes, profiles, and job analyses
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*, shared_links(*)")
    .eq("user_id", user.id);

  const { data: analyses } = await supabase
    .from("job_analyses")
    .select("*")
    .eq("user_id", user.id);

  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      profile,
    },
    resumes: resumes || [],
    jobAnalyses: analyses || [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="cvforge-data-export.json"',
    },
  });
}
