import { createClient } from "@/lib/supabase/server";
import { benchmarkLinkedInProfile } from "@/lib/server/apify/linkedin-profile";
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
    const { linkedinUrl } = await request.json();

    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com/in/")) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir LinkedIn profil bağlantısı girin (örn: https://linkedin.com/in/kullanici-adi)" },
        { status: 400 }
      );
    }

    const benchmark = await benchmarkLinkedInProfile(linkedinUrl);

    // Record usage
    await supabase.from("usage_events").insert({
      user_id: user.id,
      kind: "linkedin_import",
    });

    return NextResponse.json({ success: true, benchmark });
  } catch (err: any) {
    console.error("Profile benchmark error:", err);
    return NextResponse.json(
      { error: err.message || "LinkedIn profili incelenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
