import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { SessionUsageResponse } from "@/types/database"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      } as SessionUsageResponse, { status: 401 })
    }

    // Call the stored procedure to reset counter if needed
    await supabase.rpc('reset_weekly_sessions_if_needed', {
      p_user_id: user.id
    })

    // Get user settings with subscription tier and session count
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("subscription_tier, weekly_text_sessions_count, last_session_reset_date")
      .eq("user_id", user.id)
      .single()

    // If no settings exist, create defaults (free tier, 0 sessions)
    if (settingsError || !settings) {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          subscription_tier: 'free',
          weekly_text_sessions_count: 0,
          last_session_reset_date: new Date().toISOString().split('T')[0],
          has_active_consent: false,
          data_retention_days: 365,
          allow_data_export: true,
          pending_deletion: false,
        })

      const tier = 'free'
      const sessionsUsed = 0
      const resetDate = new Date().toISOString().split('T')[0]
      const daysUntilReset = 7

      return NextResponse.json({
        success: true,
        tier,
        sessionsUsed,
        sessionsLimit: 3,
        resetDate,
        canStartSession: true,
        daysUntilReset,
      } as SessionUsageResponse)
    }

    const tier = settings.subscription_tier
    const sessionsUsed = settings.weekly_text_sessions_count
    const resetDate = settings.last_session_reset_date

    // Calculate days until reset
    const resetDateObj = new Date(resetDate)
    resetDateObj.setDate(resetDateObj.getDate() + 7)
    const today = new Date()
    const daysUntilReset = Math.max(0, Math.ceil((resetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    // Determine if user can start a new session
    const canStartSession = tier === 'premium' || sessionsUsed < 3

    return NextResponse.json({
      success: true,
      tier,
      sessionsUsed,
      sessionsLimit: tier === 'premium' ? null : 3,
      resetDate,
      canStartSession,
      daysUntilReset,
    } as SessionUsageResponse)
  } catch (error) {
    console.error("[API] Error fetching session usage:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch session usage"
    } as SessionUsageResponse, { status: 500 })
  }
}
