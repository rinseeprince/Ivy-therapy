import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(
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
      }, { status: 401 })
    }

    // Fetch the session with messages
    const { data: session, error: sessionError } = await supabase
      .from("therapy_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id) // Security: ensure user owns session
      .single()

    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        error: "Session not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error("[API] Error fetching text session:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch session"
    }, { status: 500 })
  }
}
