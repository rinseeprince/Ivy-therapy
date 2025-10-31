"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Square, Loader2, MessageCircle, Clock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTherapyConversation } from "@/components/hooks/use-therapy-conversation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle"
import { cn } from "@/lib/utils"

interface StartSessionClientProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export function StartSessionClient({ user }: StartSessionClientProps) {
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
    transcript,
    startConversation,
    endConversation,
    sendContextUpdate,
  } = useTherapyConversation({
    onTranscriptUpdate: () => {
      // Transcript is automatically updated in the hook
    },
    onSessionStart: (convId) => {
      console.log("[StartSessionClient] ElevenLabs conversation started:", convId)
    },
    onSessionEnd: () => {
      console.log("[StartSessionClient] ElevenLabs conversation ended")
    },
    onError: (error) => {
      console.error("[StartSessionClient] Conversation error:", error)
      alert(`Conversation error: ${error}`)
    },
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
      sendContextUpdate(
        `Starting therapy session with ID: ${newSessionId}. This is a confidential therapy session.`
      )
    } catch (error) {
      console.error("[StartSessionClient] Error starting session:", error)
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
      console.error("[StartSessionClient] Error ending session:", error)
      alert("Failed to end session properly. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-cocoa-900">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-cocoa-700 dark:text-cream-100">
                  {isSessionActive ? "Session in Progress" : "Start New Session"}
                </h1>
                <p className="text-lg text-cocoa-600 dark:text-cream-200">
                  {isSessionActive
                    ? "Your AI therapist is here to listen and support you"
                    : "Begin your wellness journey when you're ready"}
                </p>
              </div>
              <DarkModeToggle />
            </div>
          </motion.div>

          {/* Session Timer */}
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 bg-gradient-to-r from-teal-400 to-teal-500 border-0">
                <div className="flex items-center justify-center gap-3 text-white">
                  <Clock className="w-5 h-5" />
                  <div className="text-center">
                    <p className="text-sm font-medium opacity-90">Session Duration</p>
                    <p className="font-mono text-2xl font-bold">{formatTime(elapsedTime)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Main Session Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-8 bg-white dark:bg-cocoa-800 border-cocoa-200/50">
              <div className="flex flex-col items-center gap-8">
                {/* AI Therapist Avatar */}
                <motion.div
                  animate={{
                    scale: isSpeaking ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "relative flex h-32 w-32 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30",
                    "transition-all duration-300",
                    isSpeaking && "shadow-lg shadow-teal-500/50"
                  )}
                >
                  <Brain
                    className={cn(
                      "h-16 w-16 text-teal-600 transition-all",
                      isSpeaking && "animate-pulse"
                    )}
                  />
                  {isSpeaking && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/30" />
                  )}
                </motion.div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100">
                    {!isSessionActive && "Ready to Begin"}
                    {isConnecting && "Connecting..."}
                    {isSessionActive &&
                      conversationStatus === "connected" &&
                      !isSpeaking &&
                      "Listening..."}
                    {isSessionActive &&
                      conversationStatus === "connected" &&
                      isSpeaking &&
                      "AI Therapist Speaking"}
                    {isSessionActive &&
                      conversationStatus === "disconnected" &&
                      "Connection Lost"}
                  </h2>
                  <p className="text-cocoa-600 dark:text-cream-200 max-w-md mx-auto">
                    {!isSessionActive &&
                      "Start your therapy session when you're ready. Find a quiet, comfortable space."}
                    {isConnecting &&
                      "Requesting microphone access and connecting to your AI therapist..."}
                    {isSessionActive &&
                      conversationStatus === "connected" &&
                      "Speak naturally. Your AI therapist is here to listen and support you."}
                    {isSessionActive &&
                      conversationStatus === "disconnected" &&
                      "Attempting to reconnect to your session..."}
                  </p>
                </div>

                {/* Transcript Preview */}
                {isSessionActive && transcript.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="w-full"
                  >
                    <Card className="max-h-48 overflow-y-auto bg-cream-50 dark:bg-cocoa-700 border-cocoa-200/50">
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-teal-600" />
                          <p className="text-sm font-medium text-cocoa-700 dark:text-cream-100">
                            Recent Conversation
                          </p>
                        </div>
                        {transcript.slice(-3).map((entry, index) => (
                          <div key={index} className="text-sm">
                            <span
                              className={cn(
                                "font-semibold",
                                entry.role === "assistant"
                                  ? "text-teal-600"
                                  : "text-cocoa-700 dark:text-cream-100"
                              )}
                            >
                              {entry.role === "assistant" ? "Therapist" : "You"}:
                            </span>{" "}
                            <span className="text-cocoa-600 dark:text-cream-200">
                              {entry.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {!isSessionActive ? (
                    <Button
                      size="lg"
                      onClick={startSession}
                      disabled={isProcessing || isConnecting}
                      className="min-w-48 bg-cocoa-700 text-cream-100 hover:bg-cocoa-800 transition-all hover:scale-105"
                    >
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
                <div className="flex items-center gap-2 text-xs text-cocoa-500 dark:text-cream-300">
                  <Shield className="w-4 h-4" />
                  <p>Your session is private and encrypted. All conversations are confidential.</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Info Cards */}
          {!isSessionActive && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered",
                  description: "Advanced AI trained in therapeutic techniques",
                },
                {
                  icon: Shield,
                  title: "Private & Secure",
                  description: "End-to-end encrypted conversations",
                },
                {
                  icon: Clock,
                  title: "Available 24/7",
                  description: "Get support whenever you need it",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-4 bg-gradient-to-br from-cream-50 to-teal-50 dark:from-cocoa-800 dark:to-cocoa-700 border-teal-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex-shrink-0">
                        <item.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cocoa-700 dark:text-cream-100 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-cocoa-600 dark:text-cream-200">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
