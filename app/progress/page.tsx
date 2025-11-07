import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ProgressPageClient from "@/components/progress/ProgressPageClient";
import { ProgressStats } from "@/types/database";

export const metadata = {
  title: "Progress Tracking | MindfulAI",
  description: "Track your mental wellness progress",
};

export default async function ProgressPage() {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch progress stats using the API-style logic
  // Get mood stats
  const { data: moodStatsData, error: moodError } = await supabase.rpc(
    "get_mood_stats",
    {
      p_user_id: user.id,
      p_days: 30,
    }
  );

  const moodStats = moodStatsData?.[0] || {
    avgMood: null,
    minMood: null,
    maxMood: null,
    totalEntries: 0,
    moodTrend: "insufficient_data",
  };

  // Get journal entries
  const { data: allJournalEntries } = await supabase
    .from("journal_entries")
    .select("id, created_at, mood_score")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get journal streak
  const { data: streakData } = await supabase.rpc("get_journal_streak", {
    p_user_id: user.id,
  });

  // Calculate longest streak
  let longestStreak = 0;
  let currentStreakCount = 0;
  let lastDate: Date | null = null;

  if (allJournalEntries && allJournalEntries.length > 0) {
    const sortedEntries = [...allJournalEntries].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sortedEntries.forEach((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        currentStreakCount = 1;
        lastDate = entryDate;
      } else {
        const dayDiff = Math.floor(
          (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreakCount++;
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
        lastDate = entryDate;
      }
    });
    longestStreak = Math.max(longestStreak, currentStreakCount);
  }

  // Calculate journal stats
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const entriesThisWeek =
    allJournalEntries?.filter(
      (entry) => new Date(entry.created_at) >= startOfWeek
    ).length || 0;

  const entriesThisMonth =
    allJournalEntries?.filter(
      (entry) => new Date(entry.created_at) >= startOfMonth
    ).length || 0;

  const avgMoodScore =
    allJournalEntries && allJournalEntries.length > 0
      ? allJournalEntries
          .filter((entry) => entry.mood_score !== null)
          .reduce((sum, entry) => sum + (entry.mood_score || 0), 0) /
        allJournalEntries.filter((entry) => entry.mood_score !== null).length
      : null;

  // Get session stats
  const { data: allSessions } = await supabase
    .from("therapy_sessions")
    .select(
      `
      id,
      started_at,
      duration_minutes,
      status,
      session_summaries (
        key_topics
      )
    `
    )
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  const completedSessions =
    allSessions?.filter((s) => s.status === "completed") || [];

  const sessionsThisWeek = completedSessions.filter(
    (session) => new Date(session.started_at) >= startOfWeek
  ).length;

  const sessionsThisMonth = completedSessions.filter(
    (session) => new Date(session.started_at) >= startOfMonth
  ).length;

  const totalDuration = completedSessions.reduce(
    (sum, session) => sum + (session.duration_minutes || 0),
    0
  );
  const avgDuration =
    completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

  // Extract topics
  const topicCounts: { [key: string]: number } = {};
  completedSessions.forEach((session: any) => {
    if (session.session_summaries && session.session_summaries.length > 0) {
      const summary = session.session_summaries[0];
      if (summary.key_topics && Array.isArray(summary.key_topics)) {
        summary.key_topics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    }
  });

  const topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Build stats object
  const stats: ProgressStats = {
    moodStats: {
      avgMood: moodStats.avgMood,
      minMood: moodStats.minMood,
      maxMood: moodStats.maxMood,
      totalEntries: moodStats.totalEntries,
      moodTrend: moodStats.moodTrend,
    },
    sessionStats: {
      totalSessions: allSessions?.length || 0,
      completedSessions: completedSessions.length,
      avgDuration: Math.round(avgDuration),
      sessionsThisWeek,
      sessionsThisMonth,
      topTopics,
    },
    journalStats: {
      totalEntries: allJournalEntries?.length || 0,
      currentStreak: streakData || 0,
      longestStreak,
      entriesThisWeek,
      entriesThisMonth,
      avgMoodScore: avgMoodScore ? Math.round(avgMoodScore * 10) / 10 : null,
    },
  };

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };

  return <ProgressPageClient initialStats={stats} user={userData} />;
}
