import { createClient } from "@/lib/supabase/server";
import { parseResumePdf } from "@/lib/server/apify/resume-parser";
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Imported Resume";

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    // Size limit check: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    // Convert to text or base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const content = await parseResumePdf(base64, file.name);

    // Save as new resume in Supabase
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title || `${content.basics.fullName || "PDF"} Resume`,
        source: "pdf",
        template: "classic",
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log usage event
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "pdf_parse",
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to parse PDF resume" },
      { status: 500 }
    );
  }
}
