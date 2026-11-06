import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyCvsView } from "@/components/dashboard/my-cvs-view";

export const dynamic = "force-dynamic";

export default async function MyCvsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*, shared_links(id, slug, is_active, view_count, company_name)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <MyCvsView initialResumes={resumes || []} />;
}
