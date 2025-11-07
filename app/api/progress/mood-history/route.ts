import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface MoodDataPoint {
  date: string;
  moodScore: number;
  source: "journal" | "session";
}

// GET /api/progress/mood-history - Get mood history for charts
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
    const thresholdISO = thresholdDate.toISOString();

    // Get mood scores from journal entries
    const { data: journalMoods, error: journalError } = await supabase
      .from("journal_entries")
      .select("created_at, mood_score")
      .eq("user_id", user.id)
      .gte("created_at", thresholdISO)
      .not("mood_score", "is", null)
      .order("created_at", { ascending: true });

    if (journalError) {
      console.error("Error fetching journal moods:", journalError);
    }

    // Get mood scores from session summaries
    const { data: sessionMoods, error: sessionError } = await supabase
      .from("therapy_sessions")
      .select(
        `
        started_at,
        session_summaries!inner (
          mood_score
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("started_at", thresholdISO)
      .not("session_summaries.mood_score", "is", null)
      .order("started_at", { ascending: true });

    if (sessionError) {
      console.error("Error fetching session moods:", sessionError);
    }

    // Combine and format data
    const moodData: MoodDataPoint[] = [];

    if (journalMoods) {
      journalMoods.forEach((entry) => {
        moodData.push({
          date: entry.created_at,
          moodScore: entry.mood_score!,
          source: "journal",
        });
      });
    }

    if (sessionMoods) {
      sessionMoods.forEach((session: any) => {
        if (
          session.session_summaries &&
          session.session_summaries.length > 0 &&
          session.session_summaries[0].mood_score
        ) {
          moodData.push({
            date: session.started_at,
            moodScore: session.session_summaries[0].mood_score,
            source: "session",
          });
        }
      });
    }

    // Sort by date
    moodData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate daily averages if multiple entries per day
    const dailyAverages: { [key: string]: { sum: number; count: number } } = {};

    moodData.forEach((point) => {
      const dateKey = new Date(point.date).toISOString().split("T")[0];
      if (!dailyAverages[dateKey]) {
        dailyAverages[dateKey] = { sum: 0, count: 0 };
      }
      dailyAverages[dateKey].sum += point.moodScore;
      dailyAverages[dateKey].count += 1;
    });

    const aggregatedData = Object.entries(dailyAverages).map(([date, { sum, count }]) => ({
      date,
      avgMood: Math.round((sum / count) * 10) / 10,
      entryCount: count,
    }));

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      rawData: moodData,
    });
  } catch (error) {
    console.error("Error in GET /api/progress/mood-history:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
