import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-cocoa-900">
        <Card className="p-8 text-center max-w-md">
          <p className="text-cocoa-600 dark:text-cream-200 mb-4">
            Please sign in to view your dashboard.
          </p>
          <Link href="/auth/login">
            <Button className="bg-cocoa-700 text-cream-100 hover:bg-cocoa-800">
              Sign In
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Fetch user's therapy sessions
  const { data: sessions, error } = await supabase
    .from("therapy_sessions")
    .select(`
      *,
      session_summaries (*)
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  if (error) {
    console.error("Error fetching sessions:", error)
  }

  // Calculate statistics
  const totalSessions = sessions?.length || 0
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []
  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const totalHours = parseFloat((totalMinutes / 60).toFixed(1))
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

  // Calculate days since last session
  const lastSession = sessions?.[0]
  const daysSinceLastSession = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Format recent sessions for the dashboard
  const recentSessions = (sessions || []).slice(0, 5).map(session => ({
    id: session.id,
    date: new Date(session.started_at),
    duration: session.duration_minutes || 0,
    preview: session.session_summaries?.[0]?.summary || '',
    messageCount: session.transcript?.length || 0,
    topics: session.session_summaries?.[0]?.key_topics || [],
  }))

  // Calculate mood data (placeholder for now - can be enhanced with real mood tracking)
  const mockMoodData = {
    averageMood: 7.5,
    moodTrend: 'improving' as const,
    averageImprovement: 2.0,
    moodHistory: [6.5, 6.8, 7.0, 7.2, 7.5, 7.6, 7.8, 8.0, 7.9, 7.8],
  }

  const stats = {
    totalSessions,
    totalHours,
    averageSessionLength,
    daysSinceLastSession,
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url,
  }

  return (
    <DashboardPageClient
      user={userData}
      stats={stats}
      moodData={mockMoodData}
      recentSessions={recentSessions}
    />
  )
}
