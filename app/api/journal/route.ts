import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  JournalEntryInsert,
  JournalEntriesResponse,
  CreateJournalEntryRequest,
} from "@/types/database";

// GET /api/journal - Get all journal entries for the current user
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const tag = searchParams.get("tag");
    const searchQuery = searchParams.get("search");
    const minMood = searchParams.get("minMood");
    const maxMood = searchParams.get("maxMood");

    // Build query
    let query = supabase
      .from("journal_entries")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    if (searchQuery) {
      query = query.or(
        `content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`
      );
    }

    if (minMood) {
      query = query.gte("mood_score", parseInt(minMood));
    }

    if (maxMood) {
      query = query.lte("mood_score", parseInt(maxMood));
    }

    const { data: entries, error, count } = await query;

    if (error) {
      console.error("Error fetching journal entries:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }

    const response: JournalEntriesResponse = {
      success: true,
      entries: entries || [],
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/journal:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(request: NextRequest) {
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

    const body: CreateJournalEntryRequest = await request.json();

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate mood score if provided
    if (body.moodScore !== undefined && (body.moodScore < 1 || body.moodScore > 10)) {
      return NextResponse.json(
        { success: false, error: "Mood score must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Create journal entry
    const entryData: JournalEntryInsert = {
      user_id: user.id,
      session_id: body.sessionId || null,
      title: body.title || null,
      content: body.content.trim(),
      mood_score: body.moodScore || null,
      tags: body.tags || [],
    };

    const { data: entry, error } = await supabase
      .from("journal_entries")
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error("Error creating journal entry:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create journal entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/journal:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
