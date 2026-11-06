import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobFinderView } from "@/components/dashboard/job-finder-view";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <JobFinderView initialResumes={resumes || []} />;
}
