import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  JournalEntryUpdate,
  UpdateJournalEntryRequest,
  JournalEntryResponse,
} from "@/types/database";

// GET /api/journal/[id] - Get a specific journal entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { data: entry, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Journal entry not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching journal entry:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entry" },
        { status: 500 }
      );
    }

    const response: JournalEntryResponse = {
      success: true,
      entry,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/journal/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/journal/[id] - Update a journal entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body: UpdateJournalEntryRequest = await request.json();

    // Validate mood score if provided
    if (body.moodScore !== undefined && (body.moodScore < 1 || body.moodScore > 10)) {
      return NextResponse.json(
        { success: false, error: "Mood score must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: JournalEntryUpdate = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.moodScore !== undefined) updateData.mood_score = body.moodScore;
    if (body.tags !== undefined) updateData.tags = body.tags;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: entry, error } = await supabase
      .from("journal_entries")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Journal entry not found" },
          { status: 404 }
        );
      }
      console.error("Error updating journal entry:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update journal entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error in PATCH /api/journal/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/journal/[id] - Delete a journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting journal entry:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete journal entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/journal/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
