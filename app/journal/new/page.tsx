import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import NewJournalEntryClient from "@/components/journal/NewJournalEntryClient";

export const metadata = {
  title: "New Journal Entry | MindfulAI",
  description: "Create a new journal entry",
};

export default async function NewJournalEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; prompt?: string }>;
}) {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };

  return (
    <NewJournalEntryClient
      sessionId={params.sessionId}
      initialPrompt={params.prompt}
      user={userData}
    />
  );
}
