import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/access";
import { generateResumePdfBuffer } from "@/lib/resume/pdf-document";
import { ResumeContent } from "@/lib/resume/schema";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { resumeId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user profile and check access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!hasActiveAccess(profile)) {
    return NextResponse.json(
      { error: "Active subscription or trial required for PDF export" },
      { status: 403 }
    );
  }

  // Fetch resume
  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", params.resumeId)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const fullName = resume.content?.basics?.fullName || "Resume";
  const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, "-");

  // Record usage event
  await supabase.from("usage_events").insert({
    user_id: user.id,
    kind: "pdf_export",
  });

  try {
    const pdfBuffer = await generateResumePdfBuffer(resume.content as ResumeContent, resume.title);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedName}-ATS-Resume.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (pdfErr: any) {
    console.error("PDF generation error:", pdfErr);
    return NextResponse.json(
      { error: "Failed to generate PDF resume: " + pdfErr.message },
      { status: 500 }
    );
  }
}
