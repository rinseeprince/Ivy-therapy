import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressStatsResponse, ProgressStats, MoodStats } from "@/types/database";

// GET /api/progress/stats - Get comprehensive progress statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    // Get mood stats using the PostgreSQL function
    const { data: moodStatsData, error: moodError } = await supabase.rpc(
      "get_mood_stats",
      {
        p_user_id: user.id,
        p_days: days,
      }
    );

    if (moodError) {
      console.error("Error fetching mood stats:", moodError);
    }

    const moodStats: MoodStats = moodStatsData?.[0] || {
      avgMood: null,
      minMood: null,
      maxMood: null,
      totalEntries: 0,
      moodTrend: "insufficient_data",
    };

    // Get journal stats
    const { data: allJournalEntries, error: journalError } = await supabase
      .from("journal_entries")
      .select("id, created_at, mood_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (journalError) {
      console.error("Error fetching journal entries:", journalError);
    }

    // Calculate journal streak
    const { data: streakData, error: streakError } = await supabase.rpc(
      "get_journal_streak",
      {
        p_user_id: user.id,
      }
    );

    if (streakError) {
      console.error("Error fetching journal streak:", streakError);
    }

    // Calculate longest streak manually
    let longestStreak = 0;
    let currentStreakCount = 0;
    let lastDate: Date | null = null;

    if (allJournalEntries && allJournalEntries.length > 0) {
      const sortedEntries = [...allJournalEntries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

    // Calculate journal stats for different periods
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const entriesThisWeek = allJournalEntries?.filter(
      (entry) => new Date(entry.created_at) >= startOfWeek
    ).length || 0;

    const entriesThisMonth = allJournalEntries?.filter(
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
    const { data: allSessions, error: sessionsError } = await supabase
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

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
    }

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

    // Extract and count topics
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

    // Build response
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

    const response: ProgressStatsResponse = {
      success: true,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/progress/stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
