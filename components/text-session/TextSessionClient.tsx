"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  Sparkles,
  Brain,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTextSession } from "@/components/hooks/use-text-session"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle"
import { SessionLimitBanner } from "./SessionLimitBanner"
import { UpgradeModal } from "./UpgradeModal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface TextSessionClientProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export function TextSessionClient({ user }: TextSessionClientProps) {
  const [message, setMessage] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const {
    sessionId,
    messages,
    isLoading,
    isSending,
    error,
    usage,
    startSession,
    sendMessage,
    endSession,
    getDuration,
  } = useTextSession({
    onError: (error) => {
      console.error("[TextSession] Error:", error)
      // Show upgrade modal if session limit reached
      if (error.includes('Session limit reached') || error.includes('limit')) {
        setShowUpgradeModal(true)
      }
    },
    onSessionEnd: async () => {
      // Generate summary
      if (sessionId) {
        await fetch(`/api/sessions/${sessionId}/summarize`, {
          method: 'POST'
        })
        router.push(`/sessions/${sessionId}`)
      }
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update elapsed time
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(() => {
      setElapsedTime(getDuration())
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionId, getDuration])

  // Track message count for upgrade prompt
  useEffect(() => {
    if (messages.length > 0) {
      setMessageCount(Math.floor(messages.length / 2)) // Count user messages only

      // Show upgrade modal after 3 exchanges (6 messages) for free users
      if (usage?.tier === 'free' && messages.length === 6) {
        // Small delay to not interrupt the conversation flow
        setTimeout(() => {
          setShowUpgradeModal(true)
        }, 3000)
      }
    }
  }, [messages, usage])

  // Don't start session on mount - only create it when user sends first message
  // This prevents empty sessions from cluttering the history

  // Focus textarea after message is sent
  useEffect(() => {
    if (!isSending && sessionId) {
      textareaRef.current?.focus()
    }
  }, [isSending, sessionId])

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    // Create session on first message if it doesn't exist
    let activeSessionId = sessionId
    if (!activeSessionId) {
      const newSessionId = await startSession()
      if (!newSessionId) {
        // Session creation failed, error already set by startSession
        return
      }
      activeSessionId = newSessionId
    }

    await sendMessage(message, activeSessionId)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEndSession = () => {
    // If no session was created (user never sent a message), just go back
    if (!sessionId) {
      router.push('/dashboard')
      return
    }

    setShowEndDialog(true)
  }

  const confirmEndSession = async () => {
    setShowEndDialog(false)
    setIsEndingSession(true)

    try {
      await endSession()
      // Don't reset isEndingSession - let it stay true until redirect
    } catch (error) {
      setIsEndingSession(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-cream-50 via-white to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
      <DashboardSidebar />

      {/* Ending Session Overlay */}
      <AnimatePresence>
        {isEndingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cream-100 dark:bg-cocoa-900 z-50 flex items-center justify-center"
          >
            <div className="text-center">
              {/* Brain Icon Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Brain className="w-16 h-16 text-white" />
              </motion.div>

              <h3 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                Preparing Session Overview
              </h3>
              <p className="text-cocoa-500 dark:text-cream-300 mb-8">
                Analyzing your session and generating insights...
              </p>

              {/* Animated Dots */}
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-teal-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-teal-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-teal-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Text Therapy Session
                </h1>
                {usage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.tier === 'premium' ? (
                      <span className="text-teal-600 dark:text-teal-400 font-medium">Unlimited</span>
                    ) : (
                      <span>Session {usage.sessionsUsed} of {usage.sessionsLimit} this week</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {sessionId && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleEndSession}
                disabled={!sessionId || isLoading}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                <X className="w-4 h-4 mr-2" />
                End Session
              </Button>
              <DarkModeToggle />
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Session Limit Banner */}
            {usage && usage.tier === 'free' && (
              <SessionLimitBanner
                sessionsUsed={usage.sessionsUsed}
                sessionsLimit={usage.sessionsLimit || 3}
                daysUntilReset={usage.daysUntilReset}
                variant={usage.sessionsUsed >= (usage.sessionsLimit || 3) ? 'limit' : 'warning'}
              />
            )}

            {/* Show loading only when actively creating session, not on initial load */}
            {isLoading && !sessionId && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Creating your session...</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    {error.includes('Session limit') || error.includes('limit')
                      ? 'Session Limit Reached'
                      : 'Error'}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                  {(error.includes('Session limit') || error.includes('limit')) && (
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      size="sm"
                      className="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      View Upgrade Options
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {!isLoading && messages.length === 0 && !isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to Your Session
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  This is a safe, confidential space. Share what's on your mind, and let's work through it together.
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                      msg.role === 'user'
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-2",
                        msg.role === 'user'
                          ? "text-teal-100"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Your therapist is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                disabled={isSending}
                className="min-h-[60px] max-h-[200px] resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending || isLoading}
                className="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 self-end"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* End Session Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will be saved and a summary will be generated. You can review it in your session history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Session</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndSession}>
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        trigger="in_session"
      />
    </div>
  )
}
