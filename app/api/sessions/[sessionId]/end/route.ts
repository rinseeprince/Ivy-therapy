import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const { transcript, durationMinutes } = await request.json()

    const supabase = await getSupabaseServerClient()

    const { error } = await supabase
      .from("therapy_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        transcript,
      })
      .eq("id", sessionId)

    if (error) {
      console.error("[API] Supabase error:", error)
      throw error
    }

    console.log("[API] Session ended successfully:", sessionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error ending session:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
