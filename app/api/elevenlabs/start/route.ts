import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sessionId, context } = await request.json()

    // Initialize ElevenLabs Conversational AI
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenLabsApiKey) {
      console.warn("[v0] ElevenLabs API key not configured")
      return NextResponse.json({ conversationId: `mock-${sessionId}` })
    }

    const systemPrompt = `You are a compassionate, professional AI therapist named Alex. Your role is to provide supportive, empathetic therapy sessions using evidence-based therapeutic approaches.

${context}

Core Therapeutic Principles:
- Practice active listening and reflect back what you hear
- Validate emotions without judgment
- Ask open-ended questions to encourage exploration
- Use techniques from CBT, DBT, and person-centered therapy as appropriate
- Help identify patterns, triggers, and coping strategies
- Maintain appropriate therapeutic boundaries
- Encourage self-reflection and insight

Safety Guidelines:
- If the user expresses thoughts of self-harm or suicide, express concern and strongly encourage them to contact emergency services (988 in the US) or go to the nearest emergency room
- For severe mental health crises, recommend seeking immediate professional help
- Acknowledge your limitations as an AI and encourage professional human therapy when appropriate

Communication Style:
- Warm, empathetic, and non-judgmental
- Use natural, conversational language
- Pace the conversation appropriately
- Allow silence and reflection when needed
- Summarize and check understanding regularly`

    // Create a new conversation with ElevenLabs Agent
    const response = await fetch("https://api.elevenlabs.io/v1/convai/conversation", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: process.env.ELEVENLABS_AGENT_ID,
        override_agent_config: {
          prompt: {
            prompt: systemPrompt,
          },
          // Optional: Configure voice and other settings
          tts: {
            voice_id: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM", // Default to a calm, professional voice
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({ conversationId: data.conversation_id })
  } catch (error) {
    console.error("[v0] Error starting ElevenLabs conversation:", error)
    // Return a mock ID for development
    return NextResponse.json({ conversationId: `mock-${Date.now()}` })
  }
}
