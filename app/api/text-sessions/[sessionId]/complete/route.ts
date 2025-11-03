import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { CompleteSessionRequest, CompleteSessionResponse } from "@/types/database"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const supabase = await getSupabaseServerClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      } as CompleteSessionResponse, { status: 401 })
    }

    // Parse request body
    const body: CompleteSessionRequest = await request.json()
    const { durationMinutes } = body

    // Update session status to completed
    const { data: session, error: updateError } = await supabase
      .from("therapy_sessions")
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes
      })
      .eq("id", sessionId)
      .eq("user_id", user.id) // Security: ensure user owns session
      .select()
      .single()

    if (updateError || !session) {
      console.error("[API] Error completing session:", updateError)
      return NextResponse.json({
        success: false,
        error: "Failed to complete session"
      } as CompleteSessionResponse, { status: 500 })
    }

    // Log privacy audit event
    await supabase
      .from("privacy_audit")
      .insert({
        user_id: user.id,
        event: "text_session_completed",
        details: {
          session_id: sessionId,
          duration_minutes: durationMinutes,
          message_count: session.transcript?.length || 0
        }
      })

    console.log("[API] Completed text session:", sessionId, `(${durationMinutes} mins)`)

    return NextResponse.json({
      success: true
    } as CompleteSessionResponse)
  } catch (error) {
    console.error("[API] Error completing text session:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to complete text session"
    } as CompleteSessionResponse, { status: 500 })
  }
}
