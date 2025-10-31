import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { SessionDetailClient } from "@/components/sessions/SessionDetailClient"
import Link from "next/link"

export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await getSupabaseServerClient()

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-cocoa-900">
        <Card className="p-8 text-center max-w-md">
          <p className="text-cocoa-600 dark:text-cream-200 mb-4">
            Please sign in to view this session.
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

  // Fetch session with summary
  const { data: session, error } = await supabase
    .from("therapy_sessions")
    .select(
      `
      *,
      session_summaries (*)
    `,
    )
    .eq("id", sessionId)
    .eq("user_id", user.id) // Ensure user owns this session
    .single()

  if (error || !session) {
    notFound()
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url,
  }

  return (
    <SessionDetailClient
      user={userData}
      session={session}
    />
  )
}
