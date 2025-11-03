"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TextSessionMessage, SessionUsageResponse } from '@/types/database'

interface UseTextSessionOptions {
  onError?: (error: string) => void
  onSessionEnd?: () => void
}

export function useTextSession(options: UseTextSessionOptions = {}) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<TextSessionMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<SessionUsageResponse | null>(null)
  const startTimeRef = useRef<number>(0)

  // Fetch session usage
  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/text-sessions/usage')
      const data: SessionUsageResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch usage')
      }

      setUsage(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage'
      setError(errorMessage)
      options.onError?.(errorMessage)
      return null
    }
  }, []) // Remove options from deps to prevent infinite loops

  // Start a new session
  const startSession = useCallback(async () => {
    // Don't start if already have a session
    if (sessionId) {
      return sessionId
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/text-sessions/create', {
        method: 'POST'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create session')
      }

      setSessionId(data.sessionId)
      setMessages([])
      startTimeRef.current = Date.now()

      // Refresh usage after starting session
      await fetchUsage()

      return data.sessionId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session'
      setError(errorMessage)
      options.onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, fetchUsage])

  // Send a message
  const sendMessage = useCallback(async (content: string, targetSessionId?: string) => {
    const activeSessionId = targetSessionId || sessionId

    if (!activeSessionId) {
      const errorMessage = 'No active session'
      setError(errorMessage)
      return
    }

    if (!content.trim()) {
      return
    }

    setIsSending(true)
    setError(null)

    // Add user message immediately
    const userMessage: TextSessionMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch(`/api/text-sessions/${activeSessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: content })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let assistantMessage: TextSessionMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }

      // Add placeholder for assistant message
      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage.content += parsed.content
                // Update the last message (assistant's reply) in real-time
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = { ...assistantMessage }
                  return newMessages
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)

      // Remove the placeholder assistant message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsSending(false)
    }
  }, [sessionId])

  // End the session
  const endSession = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)

    try {
      const durationMinutes = Math.floor((Date.now() - startTimeRef.current) / 60000)

      const response = await fetch(`/api/text-sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ durationMinutes })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to end session')
      }

      options.onSessionEnd?.()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, options])

  // Get session duration in seconds
  const getDuration = useCallback(() => {
    if (startTimeRef.current === 0) return 0
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }, [])

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return {
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
    fetchUsage,
  }
}
