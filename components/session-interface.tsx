"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Mic, MicOff, Square, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTherapyConversation } from "@/components/hooks/use-therapy-conversation"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"

export function SessionInterface() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const router = useRouter()

  const {
    status: conversationStatus,
    isSpeaking,
    isConnecting,
    conversationId,
    transcript,
    startConversation,
    endConversation,
    sendContextUpdate
  } = useTherapyConversation({
    onTranscriptUpdate: (newTranscript) => {
      // Transcript is automatically updated in the hook
    },
    onSessionStart: (convId) => {
      console.log('[SessionInterface] ElevenLabs conversation started:', convId)
    },
    onSessionEnd: () => {
      console.log('[SessionInterface] ElevenLabs conversation ended')
    },
    onError: (error) => {
      console.error('[SessionInterface] Conversation error:', error)
      alert(`Conversation error: ${error}`)
    }
  })

  // Timer for session duration
  useEffect(() => {
    if (!isSessionActive || !sessionStartTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isSessionActive, sessionStartTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startSession = async () => {
    try {
      setIsProcessing(true)

      // Create a new session in the database
      const response = await fetch("/api/sessions/create", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to create session")

      const { sessionId: newSessionId } = await response.json()
      setSessionId(newSessionId)
      setSessionStartTime(new Date())
      setIsSessionActive(true)

      // Start ElevenLabs conversation
      await startConversation()

      // Send initial context to the conversation
      sendContextUpdate(`Starting therapy session with ID: ${newSessionId}. This is a confidential therapy session.`)
    } catch (error) {
      console.error("[SessionInterface] Error starting session:", error)
      alert("Failed to start session. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }


  const endSession = async () => {
    if (!sessionId) return

    try {
      setIsProcessing(true)

      // End the ElevenLabs conversation
      await endConversation()

      // Update session status and save transcript
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          durationMinutes: Math.floor(elapsedTime / 60),
        }),
      })

      // Generate summary using OpenAI
      await fetch(`/api/sessions/${sessionId}/summarize`, {
        method: "POST",
      })

      // Reset local state
      setIsSessionActive(false)
      setSessionId(null)
      setSessionStartTime(null)
      setElapsedTime(0)

      // Redirect to session summary page
      router.push(`/sessions/${sessionId}`)
    } catch (error) {
      console.error("[SessionInterface] Error ending session:", error)
      alert("Failed to end session properly. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }


  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <AuthenticatedHeader />

      {/* Main Session Area */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Session Timer */}
          {isSessionActive && (
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Session Duration</p>
              <p className="font-mono text-2xl font-semibold text-cocoa-900">{formatTime(elapsedTime)}</p>
            </div>
          )}

          <Card className="w-full p-8">
            <div className="flex flex-col items-center gap-8">
            {/* AI Therapist Avatar */}
            <div
              className={`relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sand-100 to-sand-50 transition-all ${isSpeaking ? "scale-110 shadow-lg shadow-cocoa-900/20" : ""}`}
            >
              <Brain className={`h-16 w-16 text-cocoa-900 transition-all ${isSpeaking ? "animate-pulse" : ""}`} />
              {isSpeaking && <div className="absolute inset-0 animate-ping rounded-full bg-cocoa-900/20" />}
            </div>

            {/* Status Text */}
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold">
                {!isSessionActive && "Ready to Begin"}
                {isConnecting && "Connecting..."}
                {isSessionActive && conversationStatus === "connected" && !isSpeaking && "Listening..."}
                {isSessionActive && conversationStatus === "connected" && isSpeaking && "AI Therapist Speaking"}
                {isSessionActive && conversationStatus === "disconnected" && "Connection Lost"}
              </h2>
              <p className="text-balance text-muted-foreground">
                {!isSessionActive && "Start your therapy session when you're ready. Find a quiet, comfortable space."}
                {isConnecting && "Requesting microphone access and connecting to your AI therapist..."}
                {isSessionActive && conversationStatus === "connected" && "Speak naturally. Your AI therapist is here to listen and support you."}
                {isSessionActive && conversationStatus === "disconnected" && "Attempting to reconnect to your session..."}
              </p>
            </div>

            {/* Transcript Preview */}
            {isSessionActive && transcript.length > 0 && (
              <div className="w-full max-h-48 overflow-y-auto rounded-lg bg-muted/50 p-4">
                <div className="space-y-3">
                  {transcript.slice(-3).map((entry, index) => (
                    <div key={index} className={`text-sm ${entry.role === "assistant" ? "text-cocoa-900" : ""}`}>
                      <span className="font-semibold">{entry.role === "assistant" ? "Therapist" : "You"}:</span>{" "}
                      <span className="text-muted-foreground">{entry.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!isSessionActive ? (
                <Button size="lg" onClick={startSession} disabled={isProcessing || isConnecting} className="min-w-48" style={{ backgroundColor: '#2a1a17', color: 'white' }}>
                  {isProcessing || isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isConnecting ? "Connecting..." : "Starting..."}
                    </>
                  ) : (
                    "Start Session"
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endSession}
                  disabled={isProcessing}
                  className="min-w-48"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Ending...
                    </>
                  ) : (
                    <>
                      <Square className="mr-2 h-5 w-5" />
                      End Session
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Privacy Notice */}
            <p className="text-center text-xs text-muted-foreground">
              Your session is private and encrypted. All conversations are confidential.
            </p>
          </div>
        </Card>
        </div>
      </main>
    </div>
  )
}
