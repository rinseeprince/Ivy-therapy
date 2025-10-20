export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface TherapySession {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  status: "in_progress" | "completed" | "cancelled"
  transcript: TranscriptEntry[]
  created_at: string
}

export interface TranscriptEntry {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface SessionSummary {
  id: string
  session_id: string
  summary: string
  key_topics: string[]
  next_steps: string[]
  mood_assessment: string | null
  therapist_notes: string | null
  created_at: string
}
