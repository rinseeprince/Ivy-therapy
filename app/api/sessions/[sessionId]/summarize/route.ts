import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const supabase = await getSupabaseServerClient()

    console.log("[API] Generating summary for session:", sessionId)

    // Fetch the session with transcript
    const { data: session, error: sessionError } = await supabase
      .from("therapy_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      console.error("[API] Error fetching session:", sessionError)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Extract transcript content
    const transcript = session.transcript || []
    if (transcript.length === 0) {
      console.log("[API] No transcript available for session:", sessionId)
      return NextResponse.json({ error: "No transcript available" }, { status: 400 })
    }

    // Format transcript for OpenAI
    const conversationText = transcript
      .map((entry: any) => `${entry.role === 'assistant' ? 'Therapist' : 'Patient'}: ${entry.content}`)
      .join('\n\n')

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional therapist writing a session summary for your patient. Analyze the following therapy session transcript and provide a comprehensive summary written directly to the patient. Respond with a JSON object containing:
          - summary: A warm, supportive overview of the session written to the patient using "you" (2-3 paragraphs)
          - key_topics: Array of main topics the patient discussed (3-5 topics)
          - next_steps: Array of personalized recommendations for the patient using "you" (2-4 items)
          - mood_assessment: Brief, encouraging assessment of the patient's emotional state during the session
          - therapist_notes: Supportive observations and encouragement written directly to the patient
          
          Write everything as if you're speaking directly to the patient. Be warm, empathetic, supportive, and encouraging. Use "you" throughout and focus on their progress and strengths.`
        },
        {
          role: "user",
          content: `Please analyze this therapy session transcript:\n\n${conversationText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const summaryContent = completion.choices[0]?.message?.content
    if (!summaryContent) {
      throw new Error("No summary generated from OpenAI")
    }

    // Parse the JSON response
    let summaryData
    try {
      summaryData = JSON.parse(summaryContent)
    } catch (parseError) {
      console.error("[API] Error parsing OpenAI response:", parseError)
      // Fallback summary if parsing fails
      summaryData = {
        summary: summaryContent,
        key_topics: ["Session completed"],
        next_steps: ["Continue therapy sessions"],
        mood_assessment: "Assessment pending",
        therapist_notes: "Generated summary available"
      }
    }

    // Save summary to database
    const { error: summaryError } = await supabase
      .from("session_summaries")
      .insert({
        session_id: sessionId,
        summary: summaryData.summary,
        key_topics: summaryData.key_topics,
        next_steps: summaryData.next_steps,
        mood_assessment: summaryData.mood_assessment,
        therapist_notes: summaryData.therapist_notes
      })

    if (summaryError) {
      console.error("[API] Error saving summary:", summaryError)
      throw summaryError
    }

    console.log("[API] Summary generated and saved for session:", sessionId)
    return NextResponse.json({ success: true, summary: summaryData })
  } catch (error) {
    console.error("[API] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
