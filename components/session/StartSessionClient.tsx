"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  FileText,
  X,
  AlertCircle,
  Phone,
  Ear,
  MessageCircle,
  Shield,
} from "lucide-react"
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

type SessionState =
  | "idle" // Not started
  | "connecting" // Establishing connection
  | "connected" // Connected, waiting to start
  | "listening" // AI is listening to user
  | "processing" // AI is processing user's words
  | "speaking" // AI is speaking
  | "muted" // User has muted microphone
  | "ending" // Session is ending, preparing summary
  | "ended" // Session ended
  | "error" // Connection error

export function StartSessionClient({ user }: StartSessionClientProps) {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>("idle")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [needsMicPermission, setNeedsMicPermission] = useState(false)
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
      setConnectionError(null)
    },
    onSessionEnd: () => {
      console.log("[StartSessionClient] ElevenLabs conversation ended")
    },
    onError: (error) => {
      console.error("[StartSessionClient] Conversation error:", error)
      setConnectionError(error)
      setSessionState("error")
    },
  })

  // Update session state based on conversation status
  useEffect(() => {
    if (!isSessionActive) {
      setSessionState("idle")
      return
    }

    if (isConnecting) {
      setSessionState("connecting")
      return
    }

    // Don't override the "ending" state with error state
    if (sessionState === "ending") {
      return
    }

    if (isMuted) {
      setSessionState("muted")
      return
    }

    if (conversationStatus === "disconnected") {
      setSessionState("error")
      return
    }

    if (conversationStatus === "connected") {
      if (isSpeaking) {
        setSessionState("speaking")
      } else {
        setSessionState("listening")
      }
    }
  }, [isSessionActive, isConnecting, conversationStatus, isSpeaking, isMuted, sessionState])

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

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
      if (result.state === "prompt") {
        setNeedsMicPermission(true)
      }
    } catch (error) {
      console.log("Could not check microphone permission")
    }
  }

  useEffect(() => {
    checkMicrophonePermission()
  }, [])

  const startSession = async () => {
    try {
      setIsProcessing(true)
      setConnectionError(null)

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
      setConnectionError(
        error instanceof Error ? error.message : "Failed to start session. Please try again."
      )
      setSessionState("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const endSession = async () => {
    if (!sessionId) return

    try {
      setIsProcessing(true)
      setSessionState("ending") // Set to ending state immediately

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
      setSessionState("ended")

      // Redirect to session summary page
      router.push(`/sessions/${sessionId}`)
    } catch (error) {
      console.error("[StartSessionClient] Error ending session:", error)
      alert("Failed to end session properly. Please try again.")
      setSessionState("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Actually mute/unmute the microphone in the conversation
  }

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript)
  }

  const retryConnection = async () => {
    setConnectionError(null)
    await startSession()
  }

  const getStatusInfo = () => {
    switch (sessionState) {
      case "listening":
        return {
          icon: <Ear className="w-6 h-6 text-teal-600" />,
          title: "I'm listening...",
          subtitle: "Speak naturally, I'm here to listen",
        }
      case "speaking":
        return {
          icon: <MessageCircle className="w-6 h-6 text-teal-600" />,
          title: "Speaking...",
          subtitle: "Let me share my thoughts...",
        }
      case "processing":
        return {
          icon: <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />,
          title: "Thinking...",
          subtitle: "Processing your words...",
        }
      case "muted":
        return {
          icon: <MicOff className="w-6 h-6 text-cocoa-500" />,
          title: "Microphone muted",
          subtitle: "Unmute to continue the conversation",
        }
      default:
        return {
          icon: <Brain className="w-6 h-6 text-teal-600" />,
          title: "Ready",
          subtitle: "Your AI therapist is ready",
        }
    }
  }

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-cocoa-900">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {!isSessionActive ? (
          // PRE-SESSION LANDING PAGE
          <div className="h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl w-full text-center"
            >
              <div className="absolute top-6 right-6">
                <DarkModeToggle />
              </div>

              {/* Large Animated Microphone Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 30px rgba(127, 221, 184, 0.4)",
                    "0 0 60px rgba(127, 221, 184, 0.7)",
                    "0 0 30px rgba(127, 221, 184, 0.4)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-teal-300 to-teal-500 flex items-center justify-center mx-auto mb-6 sm:mb-8"
              >
                {/* Ripple effect rings */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full border-4 border-teal-400"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full border-4 border-teal-400"
                />

                <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-white relative z-10" />
              </motion.div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cocoa-700 dark:text-cream-100 mb-3 sm:mb-4 px-4">
                Ready for Your Voice Session?
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-cocoa-600 dark:text-cream-200 mb-8 sm:mb-12 max-w-xl mx-auto px-4">
                Find a quiet space where you can speak openly and comfortably with your AI
                therapist
              </p>

              {/* Start Voice Session Button */}
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={startSession}
                disabled={isProcessing || isConnecting}
                className="px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-cocoa-700 text-cream-100 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-semibold shadow-2xl hover:shadow-3xl hover:bg-cocoa-800 transition-all duration-300 flex items-center gap-3 sm:gap-4 mx-auto group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isProcessing || isConnecting ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </motion.div>

                <span>{isProcessing || isConnecting ? "Connecting..." : "Start Voice Session"}</span>

                {!isProcessing && !isConnecting && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Phone className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>

              {/* Privacy Info */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-cocoa-500 dark:text-cream-300">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Private & Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>Voice-Only Session</span>
                </div>
              </div>

              {/* Microphone Permission Notice */}
              <AnimatePresence>
                {needsMicPermission && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3 max-w-md mx-auto"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                        Microphone Access Required
                      </p>
                      <p className="text-amber-700 dark:text-amber-300">
                        We need permission to access your microphone for the voice session.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          // ACTIVE VOICE SESSION INTERFACE
          <div className="flex flex-col h-full">
            {/* Session Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-cream-50/80 dark:bg-cocoa-800/80 backdrop-blur-xl border-b border-cocoa-200/20 dark:border-cocoa-700/30"
            >
              {/* Left: Session Status */}
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 flex-shrink-0"
                />
                <div>
                  <div className="text-xs sm:text-sm text-cocoa-500 dark:text-cream-300">Session Active</div>
                  <div className="text-xl sm:text-2xl font-semibold text-cocoa-700 dark:text-cream-100 tabular-nums">
                    {formatTime(elapsedTime)}
                  </div>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block">
                  <DarkModeToggle />
                </div>

                {/* Transcript Toggle - Desktop */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTranscript}
                  className="hidden md:flex px-4 py-2 rounded-xl border-2 border-cocoa-300 dark:border-cocoa-600 text-cocoa-700 dark:text-cream-100 hover:bg-cocoa-100 dark:hover:bg-cocoa-700 transition-all duration-300 items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {showTranscript ? "Hide" : "Show"} Transcript
                </motion.button>

                {/* Transcript Toggle - Mobile (Icon Only) */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTranscript}
                  className="md:hidden p-2 rounded-xl border-2 border-cocoa-300 dark:border-cocoa-600 text-cocoa-700 dark:text-cream-100 hover:bg-cocoa-100 dark:hover:bg-cocoa-700 transition-all duration-300"
                  aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
                >
                  <FileText className="w-5 h-5" />
                </motion.button>

                {/* End Call */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={endSession}
                  disabled={isProcessing}
                  className="px-3 sm:px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">End Session</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center relative">
              {sessionState === "connecting" ? (
                // CONNECTING STATE
                <div className="text-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 mx-auto mb-6 flex items-center justify-center"
                  >
                    <Phone className="w-16 h-16 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                    Connecting...
                  </h3>
                  <p className="text-cocoa-500 dark:text-cream-300">
                    Establishing secure voice connection
                  </p>

                  {/* Loading dots */}
                  <div className="flex gap-2 justify-center mt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.5, 1],
                          backgroundColor: [
                            "rgba(127, 221, 184, 0.5)",
                            "rgba(127, 221, 184, 1)",
                            "rgba(127, 221, 184, 0.5)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                        className="w-3 h-3 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ) : sessionState === "ending" ? (
                // ENDING STATE - Preparing session overview
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 mx-auto mb-6 flex items-center justify-center"
                  >
                    <Brain className="w-16 h-16 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                    Preparing Session Overview
                  </h3>
                  <p className="text-cocoa-500 dark:text-cream-300">
                    Analyzing your session and generating insights...
                  </p>

                  {/* Loading dots */}
                  <div className="flex gap-2 justify-center mt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.5, 1],
                          backgroundColor: [
                            "rgba(127, 221, 184, 0.5)",
                            "rgba(127, 221, 184, 1)",
                            "rgba(127, 221, 184, 0.5)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                        className="w-3 h-3 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ) : sessionState === "error" ? (
                // ERROR STATE
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-6 flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                  </div>

                  <h3 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                    Connection Issue
                  </h3>
                  <p className="text-cocoa-500 dark:text-cream-300 mb-6">
                    {connectionError ||
                      "We couldn't establish a voice connection. Please check your microphone and try again."}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retryConnection}
                    className="px-8 py-3 bg-cocoa-700 text-cream-100 rounded-xl hover:bg-cocoa-800 transition-all duration-300"
                  >
                    Try Again
                  </motion.button>
                </div>
              ) : (
                // ACTIVE SESSION - AUDIO VISUALIZER
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-gradient-to-br from-cream-100 via-cream-50 to-teal-50/30 dark:from-cocoa-900 dark:via-cocoa-800 dark:to-cocoa-900">
                  <div className="relative">
                    {/* Main Orb */}
                    <motion.div
                      animate={{
                        scale:
                          sessionState === "speaking"
                            ? [1, 1.15, 1]
                            : isMuted
                              ? 1
                              : [1, 1.05, 1],
                        boxShadow:
                          sessionState === "speaking"
                            ? [
                                "0 0 60px rgba(127, 221, 184, 0.6)",
                                "0 0 100px rgba(127, 221, 184, 0.8)",
                                "0 0 60px rgba(127, 221, 184, 0.6)",
                              ]
                            : isMuted
                              ? "0 0 30px rgba(107, 81, 61, 0.3)"
                              : [
                                  "0 0 40px rgba(127, 221, 184, 0.4)",
                                  "0 0 60px rgba(127, 221, 184, 0.6)",
                                  "0 0 40px rgba(127, 221, 184, 0.4)",
                                ],
                      }}
                      transition={{
                        duration: sessionState === "speaking" ? 0.8 : 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center relative transition-colors duration-500",
                        isMuted
                          ? "bg-gradient-to-br from-cocoa-400 to-cocoa-500"
                          : "bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600"
                      )}
                    >
                      {/* Inner circle */}
                      <motion.div
                        animate={{
                          scale: sessionState === "speaking" ? [1, 1.2, 1] : [1, 1.1, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: sessionState === "speaking" ? 0.6 : 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-8 rounded-full bg-white/30"
                      />

                      {/* Icon */}
                      <motion.div
                        animate={{
                          rotate: sessionState === "speaking" ? [0, 5, -5, 0] : 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {isMuted ? (
                          <MicOff className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-white/90" />
                        ) : (
                          <Brain className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-white/90" />
                        )}
                      </motion.div>

                      {/* Audio level particles (if not muted) */}
                      {!isMuted && (
                        <>
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeOut",
                              }}
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-140px)`,
                              }}
                            />
                          ))}
                        </>
                      )}
                    </motion.div>

                    {/* Outer ripple rings */}
                    {!isMuted && (
                      <>
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 rounded-full border-4 border-teal-400"
                        />

                        <motion.div
                          animate={{
                            scale: [1, 1.6, 1],
                            opacity: [0.3, 0, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: 1,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 rounded-full border-4 border-teal-300"
                        />
                      </>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <motion.div
                    key={sessionState}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-4 sm:py-6 md:py-8 px-4"
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                      <motion.div
                        animate={
                          sessionState === "listening" || sessionState === "speaking"
                            ? { scale: [1, 1.2, 1] }
                            : {}
                        }
                        transition={{
                          duration: sessionState === "speaking" ? 0.8 : 1,
                          repeat: Infinity,
                        }}
                      >
                        {getStatusInfo().icon}
                      </motion.div>
                      <span className="text-lg sm:text-xl font-medium text-cocoa-700 dark:text-cream-100">
                        {getStatusInfo().title}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-cocoa-400 dark:text-cream-300">
                      {getStatusInfo().subtitle}
                    </p>
                  </motion.div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    {/* Mute/Unmute Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMute}
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center",
                        isMuted
                          ? "bg-cocoa-600 hover:bg-cocoa-700"
                          : "bg-teal-500 hover:bg-teal-600"
                      )}
                      aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                    >
                      <motion.div
                        animate={isMuted ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, repeat: isMuted ? Infinity : 0 }}
                      >
                        {isMuted ? (
                          <MicOff className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                        ) : (
                          <Mic className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                        )}
                      </motion.div>
                    </motion.button>

                    {/* End Call Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={endSession}
                      disabled={isProcessing}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="End session"
                    >
                      <PhoneOff className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Live Transcript Sidebar */}
              <AnimatePresence>
                {showTranscript && isSessionActive && sessionState !== "connecting" && (
                  <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-cream-50/95 dark:bg-cocoa-800/95 backdrop-blur-xl border-l border-cocoa-200/30 dark:border-cocoa-700/30 shadow-2xl overflow-hidden z-10"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-cocoa-200/30 dark:border-cocoa-700/30 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-cocoa-700 dark:text-cream-100 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Live Transcript
                      </h3>
                      <button
                        onClick={toggleTranscript}
                        className="p-2 rounded-lg hover:bg-cocoa-100 dark:hover:bg-cocoa-700 transition-colors"
                      >
                        <X className="w-5 h-5 text-cocoa-600 dark:text-cream-200" />
                      </button>
                    </div>

                    {/* Transcript Content */}
                    <div className="overflow-y-auto h-[calc(100%-80px)] px-6 py-4 space-y-4">
                      {transcript.length === 0 ? (
                        <div className="text-center text-cocoa-400 dark:text-cream-400 text-sm py-8">
                          Start speaking to see the transcript...
                        </div>
                      ) : (
                        transcript.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={cn(item.role === "assistant" ? "text-left" : "text-right")}
                          >
                            <div
                              className={cn(
                                "inline-block max-w-[85%] p-3 rounded-xl text-sm",
                                item.role === "assistant"
                                  ? "bg-teal-100/80 dark:bg-teal-900/30 text-cocoa-700 dark:text-cream-100"
                                  : "bg-cocoa-700 dark:bg-cocoa-600 text-cream-100"
                              )}
                            >
                              <div className="text-xs opacity-70 mb-1">
                                {item.role === "assistant" ? "MindfulAI" : "You"}
                              </div>
                              <p className="leading-relaxed">{item.content}</p>
                            </div>
                          </motion.div>
                        ))
                      )}

                      {/* Typing indicator in transcript */}
                      {sessionState === "processing" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-left"
                        >
                          <div className="inline-block bg-teal-100/80 dark:bg-teal-900/30 p-3 rounded-xl">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{
                                    y: [0, -8, 0],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                  }}
                                  className="w-2 h-2 rounded-full bg-teal-600"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
