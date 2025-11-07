import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import JournalEntryDetailClient from "@/components/journal/JournalEntryDetailClient";

export const metadata = {
  title: "Journal Entry | MindfulAI",
  description: "View and edit your journal entry",
};

export default async function JournalEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Fetch journal entry
  const { data: entry, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !entry) {
    redirect("/journal");
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };

  return <JournalEntryDetailClient entry={entry} user={userData} />;
}
