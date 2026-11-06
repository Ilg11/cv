import { createClient } from "@/lib/supabase/server";
import { defaultResumeContent } from "@/lib/resume/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*, shared_links(id, slug, is_active, view_count, company_name)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = body.title || "Untitled Resume";
    const template = body.template || "classic";
    const source = body.source || "scratch";
    const content = body.content || defaultResumeContent;

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        template,
        source,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
