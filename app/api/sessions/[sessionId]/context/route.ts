import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const supabase = await getSupabaseServerClient()

    // Get the current session to find the user
    const { data: currentSession } = await supabase
      .from("therapy_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single()

    if (!currentSession) {
      return NextResponse.json({
        context: "This is the user's first therapy session. Introduce yourself warmly and establish rapport.",
        hasHistory: false,
        previousSessionsCount: 0
      })
    }

    // Get previous sessions for this user
    const { data: previousSessions, error } = await supabase
      .from("therapy_sessions")
      .select("id, started_at")
      .eq("user_id", currentSession.user_id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(5)

    if (error) {
      console.error("[API] Error fetching previous sessions:", error)
    }

    const previousSessionsCount = previousSessions?.length || 0
    const hasHistory = previousSessionsCount > 0

    let context = hasHistory 
      ? `This user has had ${previousSessionsCount} previous therapy sessions. Continue building on your therapeutic relationship.`
      : "This is the user's first therapy session. Introduce yourself warmly and establish rapport."

    return NextResponse.json({
      context,
      hasHistory,
      previousSessionsCount
    })
  } catch (error) {
    console.error("[API] Error fetching context:", error)
    return NextResponse.json({
      context: "Unable to load previous session context. Proceed with a general therapy approach.",
      hasHistory: false,
      previousSessionsCount: 0
    })
  }
}
