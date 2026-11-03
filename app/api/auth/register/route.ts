import { createAdminClient } from "@/lib/server/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Check if user already exists
    const { data: listData } = await admin.auth.admin.listUsers();
    const existing = listData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      // If user exists, ensure they are confirmed
      if (!existing.email_confirmed_at) {
        await admin.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
          password,
        });
      }
      return NextResponse.json({ success: true, message: "User confirmed" });
    }

    // Create user with email_confirm: true (No confirmation email needed!)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Auto-confirm registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
