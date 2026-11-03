import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch original resume
  const { data: original, error: fetchErr } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !original) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // 2. Clone resume
  const duplicateTitle = `${original.title} (Copy)`;
  const { data: cloned, error: insertErr } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: duplicateTitle,
      template: original.template,
      source: original.source,
      content: original.content,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(cloned);
}
