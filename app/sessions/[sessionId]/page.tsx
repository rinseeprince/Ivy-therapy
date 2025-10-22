import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, Clock, TrendingUp, MessageCircle, Lightbulb } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SessionDetailHeader } from "@/components/SessionDetailHeader"

export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await getSupabaseServerClient()

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
    .single()

  if (error || !session) {
    notFound()
  }

  const summary = session.session_summaries?.[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SessionDetailHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Session Header */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">Session Summary</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(session.started_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {session.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {session.duration_minutes} minutes
                </div>
              )}
            </div>
          </div>

          {summary ? (
            <>
              {/* Main Summary */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Session Overview</h2>
                </div>
                <p className="leading-relaxed text-muted-foreground">{summary.summary}</p>
              </Card>

              {/* Mood Assessment */}
              {summary.mood_assessment && (
                <Card className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Mood Assessment</h2>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{summary.mood_assessment}</p>
                </Card>
              )}

              {/* Key Topics */}
              {summary.key_topics && summary.key_topics.length > 0 && (
                <Card className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Key Topics Discussed</h2>
                  </div>
                  <ul className="space-y-2">
                    {summary.key_topics.map((topic: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span className="leading-relaxed text-muted-foreground">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Next Steps */}
              {summary.next_steps && summary.next_steps.length > 0 && (
                <Card className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Next Steps</h2>
                  </div>
                  <ul className="space-y-3">
                    {summary.next_steps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Therapist Notes */}
              {summary.therapist_notes && (
                <Card className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Therapist Notes</h2>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{summary.therapist_notes}</p>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Summary is being generated. Please refresh in a moment.</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/sessions">
              <Button variant="outline">View All Sessions</Button>
            </Link>
            <Link href="/session/new">
              <Button>Start New Session</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
