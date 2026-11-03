import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
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
    const admin = createAdminClient();

    // 1. Delete all user data cascade from profiles (due to on delete cascade, resumes, links, analyses are deleted)
    await admin.from("profiles").delete().eq("id", user.id);

    // 2. Delete user from auth.users
    await admin.auth.admin.deleteUser(user.id);

    // 3. Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Account deletion failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
