import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { buildSessionContext } from "@/lib/context-builder"

/**
 * GET /api/sessions/build-context
 *
 * Builds comprehensive session context for the current user
 * by fetching all previous completed sessions and their summaries.
 *
 * Used by both text and voice therapy sessions to provide
 * long-term memory and continuity across sessions.
 */
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    // Build context from previous sessions
    const context = await buildSessionContext(user.id)

    return NextResponse.json({
      success: true,
      contextPrompt: context.contextPrompt,
      hasHistory: context.hasHistory,
      previousSessionsCount: context.previousSessionsCount,
      recentSummaries: context.recentSummaries
    })
  } catch (error) {
    console.error("[API] Error building session context:", error)

    // Return empty context on error (graceful degradation)
    return NextResponse.json({
      success: true,
      contextPrompt: "",
      hasHistory: false,
      previousSessionsCount: 0,
      recentSummaries: []
    })
  }
}
