import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { JournalStreakResponse } from "@/types/database";

// GET /api/journal/streak - Get current journal streak
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

    // Use the PostgreSQL function to calculate streak
    const { data, error } = await supabase.rpc("get_journal_streak", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error fetching journal streak:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal streak" },
        { status: 500 }
      );
    }

    const response: JournalStreakResponse = {
      success: true,
      currentStreak: data || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/journal/streak:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
