"use client"

import { useConversation } from '@elevenlabs/react'
import { useState, useCallback, useEffect } from 'react'

interface TherapyConversationProps {
  onTranscriptUpdate?: (transcript: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>) => void
  onSessionStart?: (conversationId: string) => void
  onSessionEnd?: () => void
  onError?: (error: string) => void
}

export function useTherapyConversation({
  onTranscriptUpdate,
  onSessionStart,
  onSessionEnd,
  onError
}: TherapyConversationProps = {}) {
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: string }>>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      console.log('[TherapyConversation] Connected to ElevenLabs')
    },
    onDisconnect: () => {
      console.log('[TherapyConversation] Disconnected from ElevenLabs')
      onSessionEnd?.()
    },
    onMessage: (message) => {
      const newEntry = {
        role: message.source === 'user' ? 'user' as const : 'assistant' as const,
        content: message.message || '',
        timestamp: new Date().toISOString()
      }
      
      setTranscript(prev => {
        const updated = [...prev, newEntry]
        onTranscriptUpdate?.(updated)
        return updated
      })
    },
    onError: (error) => {
      console.error('[TherapyConversation] Error:', error)
      const errorMessage = typeof error === 'string' ? error : (error as Error).message || 'An error occurred during the conversation'
      onError?.(errorMessage)
    },
    onStatusChange: (status) => {
      console.log('[TherapyConversation] Status changed:', status)
    },
    onModeChange: (mode) => {
      console.log('[TherapyConversation] Mode changed:', mode)
    }
  })

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true)
      
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
      console.log('[TherapyConversation] Agent ID:', agentId)
      
      if (!agentId) {
        throw new Error('NEXT_PUBLIC_ELEVENLABS_AGENT_ID environment variable is not set')
      }
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start the conversation with your agent ID using websocket for better compatibility
      const newConversationId = await conversation.startSession({
        agentId: agentId,
        connectionType: 'websocket'
      })
      
      setConversationId(newConversationId)
      onSessionStart?.(newConversationId)
      
      console.log('[TherapyConversation] Started with ID:', newConversationId)
    } catch (error) {
      console.error('[TherapyConversation] Failed to start:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onError?.(`Failed to start conversation: ${errorMessage}`)
    } finally {
      setIsConnecting(false)
    }
  }, [conversation, onSessionStart, onError])

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession()
      setConversationId(null)
      setTranscript([])
    } catch (error) {
      console.error('[TherapyConversation] Failed to end:', error)
      onError?.('Failed to end conversation properly')
    }
  }, [conversation, onError])

  const sendMessage = useCallback((message: string) => {
    conversation.sendUserMessage(message)
  }, [conversation])

  const sendContextUpdate = useCallback((context: string) => {
    conversation.sendContextualUpdate(context)
  }, [conversation])

  return {
    // State
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    isConnecting,
    conversationId,
    transcript,
    
    // Actions
    startConversation,
    endConversation,
    sendMessage,
    sendContextUpdate,
    
    // Volume controls
    setVolume: conversation.setVolume,
    
    // Feedback
    sendFeedback: conversation.sendFeedback,
    canSendFeedback: conversation.canSendFeedback
  }
}