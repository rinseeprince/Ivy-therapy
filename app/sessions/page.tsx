import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, PlayCircle } from "lucide-react"
import Link from "next/link"
import { SessionsPageClient } from "@/components/sessions/SessionsPageClient"

export default async function SessionsPage() {
  const supabase = await getSupabaseServerClient()

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-cocoa-900">
        <Card className="p-8 text-center max-w-md">
          <p className="text-cocoa-600 dark:text-cream-200 mb-4">
            Please sign in to view your sessions.
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

  // Calculate stats
  const totalSessions = sessions?.length || 0
  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const averageDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0

  return (
    <SessionsPageClient
      user={{
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url,
      }}
      sessions={sessions || []}
      stats={{
        totalSessions,
        completedSessions,
        totalMinutes,
        averageDuration,
      }}
    />
  )
}