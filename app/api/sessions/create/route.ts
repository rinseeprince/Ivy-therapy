import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user profile exists in our users table
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      })

    if (profileError) {
      console.error("[API] Error creating user profile:", profileError)
      // Continue anyway - the profile might already exist
    }

    const { data: session, error } = await supabase
      .from("therapy_sessions")
      .insert({
        user_id: user.id,
        status: "in_progress",
        transcript: [],
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Supabase error:", error)
      throw error
    }

    console.log("[API] Created session:", session.id, "for user:", user.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("[API] Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
