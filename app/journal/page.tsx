import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import JournalPageClient from "@/components/journal/JournalPageClient";

export const metadata = {
  title: "Journal Entries | MindfulAI",
  description: "Your personal reflection space for mental wellness",
};

export default async function JournalPage() {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch journal entries
  const { data: entries, error: entriesError } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (entriesError) {
    console.error("Error fetching journal entries:", entriesError);
  }

  // Get current streak
  const { data: streakData, error: streakError } = await supabase.rpc(
    "get_journal_streak",
    {
      p_user_id: user.id,
    }
  );

  if (streakError) {
    console.error("Error fetching journal streak:", streakError);
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };

  return (
    <JournalPageClient
      initialEntries={entries || []}
      currentStreak={streakData || 0}
      user={userData}
    />
  );
}
