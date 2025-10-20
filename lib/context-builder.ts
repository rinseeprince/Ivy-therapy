import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface SessionContext {
  hasHistory: boolean
  previousSessionsCount: number
  recentSummaries: Array<{
    date: string
    summary: string
    keyTopics: string[]
    nextSteps: string[]
    moodAssessment: string | null
  }>
  contextPrompt: string
}

export async function buildSessionContext(userId: string): Promise<SessionContext> {
  const supabase = await getSupabaseServerClient()

  // Fetch the last 3 completed sessions with summaries
  const { data: sessions } = await supabase
    .from("therapy_sessions")
    .select(
      `
      id,
      started_at,
      session_summaries (
        summary,
        key_topics,
        next_steps,
        mood_assessment,
        therapist_notes
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(3)

  if (!sessions || sessions.length === 0) {
    return {
      hasHistory: false,
      previousSessionsCount: 0,
      recentSummaries: [],
      contextPrompt: `This is the user's first therapy session. 

Guidelines for first session:
- Introduce yourself warmly as their AI therapy companion
- Explain that this is a safe, confidential space
- Ask open-ended questions to understand what brought them here today
- Build rapport and establish trust
- Listen actively and validate their feelings
- Set expectations for how these sessions work`,
    }
  }

  // Build context from previous sessions
  const recentSummaries = sessions
    .map((session) => {
      const summary = session.session_summaries?.[0]
      if (!summary) return null

      return {
        date: new Date(session.started_at).toLocaleDateString(),
        summary: summary.summary,
        keyTopics: summary.key_topics || [],
        nextSteps: summary.next_steps || [],
        moodAssessment: summary.mood_assessment,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  // Build a comprehensive context prompt
  const contextParts = [`You are continuing therapy with a returning client. Here is their recent session history:\n`]

  recentSummaries.forEach((summary, index) => {
    const sessionNumber = recentSummaries.length - index
    contextParts.push(`\n--- Session ${sessionNumber} (${summary.date}) ---`)
    contextParts.push(`Summary: ${summary.summary}`)

    if (summary.keyTopics.length > 0) {
      contextParts.push(`Key Topics: ${summary.keyTopics.join(", ")}`)
    }

    if (summary.nextSteps.length > 0) {
      contextParts.push(`Next Steps Discussed: ${summary.nextSteps.join("; ")}`)
    }

    if (summary.moodAssessment) {
      contextParts.push(`Mood Assessment: ${summary.moodAssessment}`)
    }
  })

  contextParts.push(`\n--- Current Session Guidelines ---`)
  contextParts.push(`- Welcome them back warmly and acknowledge their continued commitment to therapy`)
  contextParts.push(`- Reference relevant topics from previous sessions when appropriate`)
  contextParts.push(`- Follow up on any next steps or action items from the last session`)
  contextParts.push(`- Build on the therapeutic relationship you've established`)
  contextParts.push(`- Notice and acknowledge any progress or changes since last time`)
  contextParts.push(`- Maintain continuity while allowing space for new topics to emerge`)

  return {
    hasHistory: true,
    previousSessionsCount: sessions.length,
    recentSummaries,
    contextPrompt: contextParts.join("\n"),
  }
}
