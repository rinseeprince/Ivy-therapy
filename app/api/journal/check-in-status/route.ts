import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CheckInStatus {
  success: boolean;
  hasCheckedInToday: boolean;
  lastCheckIn?: string | null;
  currentStreak?: number;
  todaysMood?: number | null;
  error?: string;
}

// GET /api/journal/check-in-status - Check if user has checked in today
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

    // Get today's date range (start and end of day in user's timezone)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if user has a journal entry today
    const { data: todaysEntry, error: entryError } = await supabase
      .from("journal_entries")
      .select("id, mood_score, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const hasCheckedInToday = !entryError && todaysEntry !== null;

    // Get last check-in
    const { data: lastEntry, error: lastError } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get current streak
    const { data: streakData, error: streakError } = await supabase.rpc(
      "get_journal_streak",
      {
        p_user_id: user.id,
      }
    );

    const response: CheckInStatus = {
      success: true,
      hasCheckedInToday,
      lastCheckIn: lastEntry?.created_at || null,
      currentStreak: streakData || 0,
      todaysMood: todaysEntry?.mood_score || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/journal/check-in-status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
