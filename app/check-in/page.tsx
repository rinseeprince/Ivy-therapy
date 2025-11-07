import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import QuickCheckInClient from "@/components/check-in/QuickCheckInClient";

export const metadata = {
  title: "Daily Check-In | MindfulAI",
  description: "Take a moment to check in with yourself",
};

export default async function CheckInPage() {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has already checked in today
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: todaysEntry } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString())
    .limit(1)
    .single();

  const hasCheckedInToday = todaysEntry !== null;

  // Get current streak
  const { data: streakData } = await supabase.rpc("get_journal_streak", {
    p_user_id: user.id,
  });

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };

  return (
    <QuickCheckInClient
      user={userData}
      currentStreak={streakData || 0}
      hasCheckedInToday={hasCheckedInToday}
    />
  );
}
