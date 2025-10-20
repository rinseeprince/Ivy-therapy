import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { conversationId } = await request.json()

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenLabsApiKey || conversationId.startsWith("mock-")) {
      return NextResponse.json({ success: true })
    }

    // End the ElevenLabs conversation
    await fetch(`https://api.elevenlabs.io/v1/convai/conversation/${conversationId}/end`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error ending ElevenLabs conversation:", error)
    return NextResponse.json({ success: true }) // Don't fail the session end
  }
}
