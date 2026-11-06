import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OptimizeHubView } from "@/components/dashboard/optimize-hub-view";

export const dynamic = "force-dynamic";

export default async function OptimizeHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <OptimizeHubView resumes={resumes || []} />;
}
