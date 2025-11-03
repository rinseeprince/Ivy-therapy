import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { CreateTextSessionResponse } from "@/types/database"

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      } as CreateTextSessionResponse, { status: 401 })
    }

    // Check if user can start a new text session
    const { data: canStart, error: limitError } = await supabase.rpc('can_start_text_session', {
      p_user_id: user.id
    })

    if (limitError) {
      console.error("[API] Error checking session limit:", limitError)
      throw limitError
    }

    if (!canStart) {
      return NextResponse.json({
        success: false,
        error: "Session limit reached. Upgrade to premium for unlimited sessions."
      } as CreateTextSessionResponse, { status: 403 })
    }

    // Create text therapy session
    const { data: session, error: sessionError } = await supabase
      .from("therapy_sessions")
      .insert({
        user_id: user.id,
        session_type: 'text',
        status: "in_progress",
        transcript: [],
      })
      .select()
      .single()

    if (sessionError) {
      console.error("[API] Error creating text session:", sessionError)
      throw sessionError
    }

    // Increment the session count
    const { error: incrementError } = await supabase.rpc('increment_text_session_count', {
      p_user_id: user.id
    })

    if (incrementError) {
      console.error("[API] Error incrementing session count:", incrementError)
      // Don't throw - session was created successfully
    }

    // Log privacy audit event
    await supabase
      .from("privacy_audit")
      .insert({
        user_id: user.id,
        event: "text_session_started",
        details: {
          session_id: session.id,
          session_type: 'text'
        }
      })

    console.log("[API] Created text session:", session.id, "for user:", user.id)
    return NextResponse.json({
      success: true,
      sessionId: session.id
    } as CreateTextSessionResponse)
  } catch (error) {
    console.error("[API] Error creating text session:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create text session"
    } as CreateTextSessionResponse, { status: 500 })
  }
}
