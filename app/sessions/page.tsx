import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, Clock, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SessionDetailHeader } from "@/components/SessionDetailHeader"

export default async function SessionsPage() {
  const supabase = await getSupabaseServerClient()

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to view your sessions.</p>
          <Link href="/auth/login">
            <Button className="mt-4">Sign In</Button>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SessionDetailHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Your Therapy Sessions</h1>
            <p className="text-muted-foreground">
              Review your past sessions and track your progress over time.
            </p>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.started_at).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {session.duration_minutes && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {session.duration_minutes} minutes
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : session.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status === 'completed' ? 'Completed' : 
                           session.status === 'in_progress' ? 'In Progress' : 
                           'Cancelled'}
                        </div>
                      </div>
                      
                      {session.session_summaries?.[0] ? (
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {session.session_summaries[0].summary.slice(0, 150)}...
                        </p>
                      ) : session.status === 'completed' ? (
                        <p className="text-muted-foreground mb-3">
                          Summary is being generated...
                        </p>
                      ) : (
                        <p className="text-muted-foreground mb-3">
                          Session transcript available
                        </p>
                      )}

                      {session.session_summaries?.[0]?.key_topics && (
                        <div className="flex flex-wrap gap-2">
                          {session.session_summaries[0].key_topics.slice(0, 3).map((topic: string, index: number) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                          {session.session_summaries[0].key_topics.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                              +{session.session_summaries[0].key_topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                      {session.transcript && session.transcript.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          {session.transcript.length} messages
                        </div>
                      )}
                      <Link href={`/sessions/${session.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No sessions yet</h3>
              <p className="mb-6 text-muted-foreground">
                Start your first therapy session to begin your mental health journey.
              </p>
              <Link href="/session/new">
                <Button>Start Your First Session</Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}