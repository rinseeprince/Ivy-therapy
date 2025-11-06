import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { buildSessionContext } from "@/lib/context-builder"
import OpenAI from "openai"
import type { SendMessageRequest } from "@/types/database"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Therapist system prompt for text sessions
const THERAPIST_SYSTEM_PROMPT = `You're an extremely good therapist trained and qualified at running therapy sessions for both men and women. You are well rounded to handle all areas of therapy.

You are to be a therapist and help with the patient and whatever they are going through. You are very empathetic, explorative and understanding.

You are to explore whatever the user is going through and guide them down a path to get to an action plan to implement at the end of the session.

Core Therapeutic Principles:
- Practice active listening and reflect back what you hear
- Validate emotions without judgment
- Ask open-ended questions to encourage exploration
- Use techniques from CBT, DBT, and person-centered therapy as appropriate
- Help identify patterns, triggers, and coping strategies
- Maintain appropriate therapeutic boundaries
- Encourage self-reflection and insight

Safety Guidelines:
- If the user expresses thoughts of self-harm or suicide, express concern and strongly encourage them to contact emergency services (988 in the US, 999 in the UK) or go to the nearest emergency room
- For severe mental health crises, recommend seeking immediate professional help
- Acknowledge your limitations as an AI and encourage professional human therapy when appropriate

Communication Style:
- Warm, empathetic, and non-judgmental
- Use natural, conversational language
- Pace the conversation appropriately
- Allow space for reflection
- Summarize and check understanding regularly`

export async function POST(
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

    // Parse request body
    const body: SendMessageRequest = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Message cannot be empty"
      }, { status: 400 })
    }

    // Fetch the session
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

    if (session.status !== 'in_progress') {
      return NextResponse.json({
        success: false,
        error: "Session is not active"
      }, { status: 400 })
    }

    // Get conversation history from transcript
    const transcript = session.transcript || []

    // Add user message to transcript
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    }

    // Build context from previous sessions (on every message for perfect recall)
    const context = await buildSessionContext(user.id)
    const contextPrompt = context.contextPrompt

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: contextPrompt
          ? `${THERAPIST_SYSTEM_PROMPT}\n\n${contextPrompt}`
          : THERAPIST_SYSTEM_PROMPT
      }
    ]

    // Add conversation history
    transcript.forEach((entry: any) => {
      messages.push({
        role: entry.role === 'user' ? 'user' : 'assistant',
        content: entry.content
      })
    })

    // Add current user message
    messages.push({
      role: "user",
      content: message
    })

    console.log("[API] Sending message to OpenAI for session:", sessionId)

    // Get response from OpenAI with streaming
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    })

    // Set up streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullReply = ''

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullReply += content
              // Send each chunk to the client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          // Save the complete conversation to database
          const assistantMessage = {
            role: 'assistant' as const,
            content: fullReply,
            timestamp: new Date().toISOString()
          }

          const updatedTranscript = [
            ...transcript,
            userMessage,
            assistantMessage
          ]

          await supabase
            .from("therapy_sessions")
            .update({ transcript: updatedTranscript })
            .eq("id", sessionId)

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error("[API] Error during streaming:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error("[API] Error sending message:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to send message"
    }, { status: 500 })
  }
}
