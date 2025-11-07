/**
 * Database Types for Consent & Data Management
 * Auto-generated types matching Supabase schema
 */

export type ExportStatus = 'queued' | 'processing' | 'ready' | 'failed';
export type DeleteStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
export type SessionType = 'voice' | 'text';
export type SubscriptionTier = 'free' | 'premium';
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface UserConsent {
  id: string;
  user_id: string;
  consent_version: string;
  consent_text_hash: string;
  acknowledged_ai_limitations: boolean;
  confirmed_not_emergency: boolean;
  confirmed_age_over_18: boolean;
  accepted_terms_privacy: boolean;
  locale: string;
  ip_inet?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  has_active_consent: boolean;
  consent_version?: string | null;
  data_retention_days: number;
  allow_data_export: boolean;
  pending_deletion: boolean;
  deletion_requested_at?: string | null;
  subscription_tier: SubscriptionTier;
  weekly_text_sessions_count: number;
  last_session_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id: string;
  user_id: string;
  session_type: SessionType;
  started_at: string;
  ended_at?: string | null;
  duration_minutes?: number | null;
  status: SessionStatus;
  transcript: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  summary: string;
  key_topics: string[];
  next_steps: string[];
  mood_assessment?: string | null;
  mood_score?: number | null;
  therapist_notes?: string | null;
  created_at: string;
}

export interface DataExport {
  id: string;
  user_id: string;
  status: ExportStatus;
  file_path?: string | null;
  error?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeletionRequest {
  id: string;
  user_id: string;
  status: DeleteStatus;
  reason?: string | null;
  confirmation_phrase?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface PrivacyAuditLog {
  id: string;
  user_id?: string | null;
  event: string;
  details?: Record<string, any> | null;
  created_at: string;
}

// Insert types (without auto-generated fields)
export type UserConsentInsert = Omit<UserConsent, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UserSettingsInsert = Omit<UserSettings, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type TherapySessionInsert = Omit<TherapySession, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SessionSummaryInsert = Omit<SessionSummary, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DataExportInsert = Omit<DataExport, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DeletionRequestInsert = Omit<DeletionRequest, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
};

export type PrivacyAuditLogInsert = Omit<PrivacyAuditLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Update types (all fields optional except ID)
export type UserConsentUpdate = Partial<Omit<UserConsent, 'id' | 'created_at'>>;
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'user_id' | 'created_at'>>;
export type DataExportUpdate = Partial<Omit<DataExport, 'id' | 'user_id' | 'created_at'>>;
export type DeletionRequestUpdate = Partial<Omit<DeletionRequest, 'id' | 'user_id' | 'created_at'>>;

// API request/response types
export interface ConsentAcceptRequest {
  consentVersion: string;
  consentTextHash: string;
  acknowledgedAiLimitations: boolean;
  confirmedNotEmergency: boolean;
  confirmedAgeOver18: boolean;
  acceptedTermsPrivacy: boolean;
  locale: string;
}

export interface ConsentAcceptResponse {
  ok: boolean;
  error?: string;
}

export interface ConsentRevokeResponse {
  ok: boolean;
  error?: string;
}

export interface DataExportRequestResponse {
  ok: boolean;
  exportId?: string;
  error?: string;
}

export interface DataExportStatusResponse {
  ok: boolean;
  export?: DataExport;
  error?: string;
}

export interface DataExportDownloadResponse {
  ok: boolean;
  url?: string;
  error?: string;
}

export interface DeleteAccountRequest {
  reason?: string;
  confirmationPhrase: string;
}

export interface DeleteAccountResponse {
  ok: boolean;
  requestId?: string;
  error?: string;
}

export interface DeleteAccountStatusResponse {
  ok: boolean;
  request?: DeletionRequest;
  error?: string;
}

// Export data schema (what users receive)
export interface UserDataExport {
  version: string;
  generated_at: string;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  settings: {
    data_retention_days: number;
    has_active_consent: boolean;
    consent_version?: string;
  };
  consents: Array<{
    created_at: string;
    version: string;
    locale: string;
  }>;
  conversations: Array<{
    id: string;
    created_at: string;
    messages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      created_at: string;
    }>;
    summaries?: Array<{
      id: string;
      text: string;
      created_at: string;
    }>;
    action_items?: Array<{
      id: string;
      text: string;
      due_date?: string | null;
      completed: boolean;
    }>;
  }>;
}

// Text session API types
export interface TextSessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CreateTextSessionResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export interface SessionUsageResponse {
  success: boolean;
  tier: SubscriptionTier;
  sessionsUsed: number;
  sessionsLimit: number | null; // null means unlimited
  resetDate: string;
  canStartSession: boolean;
  daysUntilReset: number;
  error?: string;
}

export interface CompleteSessionRequest {
  durationMinutes: number;
}

export interface CompleteSessionResponse {
  success: boolean;
  error?: string;
}

// =============================================
// JOURNAL & PROGRESS TRACKING TYPES
// =============================================

export type GoalStatus = 'active' | 'completed' | 'cancelled';
export type MetricType = 'mood' | 'anxiety' | 'sleep' | 'energy' | 'stress';
export type GoalType = 'journal_frequency' | 'session_frequency' | 'mood_average' | 'custom';
export type MilestoneType = 'session_count' | 'journal_streak' | 'time_based' | 'mood_improvement';
export type MoodTrend = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export interface JournalEntry {
  id: string;
  user_id: string;
  session_id?: string | null;
  title?: string | null;
  content: string;
  mood_score?: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgressMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  notes?: string | null;
  recorded_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description?: string | null;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  title: string;
  description?: string | null;
  value?: number | null;
  achieved_at: string;
  is_acknowledged: boolean;
  created_at: string;
}

// Insert types
export type JournalEntryInsert = Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProgressMetricInsert = Omit<ProgressMetric, 'id' | 'recorded_at'> & {
  id?: string;
  recorded_at?: string;
};

export type UserGoalInsert = Omit<UserGoal, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserMilestoneInsert = Omit<UserMilestone, 'id' | 'achieved_at' | 'created_at'> & {
  id?: string;
  achieved_at?: string;
  created_at?: string;
};

// Update types
export type JournalEntryUpdate = Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>>;
export type UserGoalUpdate = Partial<Omit<UserGoal, 'id' | 'user_id' | 'created_at'>>;

// API types
export interface CreateJournalEntryRequest {
  sessionId?: string;
  title?: string;
  content: string;
  moodScore?: number;
  tags?: string[];
}

export interface UpdateJournalEntryRequest {
  title?: string;
  content?: string;
  moodScore?: number;
  tags?: string[];
}

export interface JournalEntryResponse {
  success: boolean;
  entry?: JournalEntry;
  error?: string;
}

export interface JournalEntriesResponse {
  success: boolean;
  entries?: JournalEntry[];
  total?: number;
  error?: string;
}

export interface MoodStats {
  avgMood: number | null;
  minMood: number | null;
  maxMood: number | null;
  totalEntries: number;
  moodTrend: MoodTrend;
}

export interface ProgressStats {
  moodStats: MoodStats;
  sessionStats: {
    totalSessions: number;
    completedSessions: number;
    avgDuration: number;
    sessionsThisWeek: number;
    sessionsThisMonth: number;
    topTopics: Array<{ topic: string; count: number }>;
  };
  journalStats: {
    totalEntries: number;
    currentStreak: number;
    longestStreak: number;
    entriesThisWeek: number;
    entriesThisMonth: number;
    avgMoodScore: number | null;
  };
}

export interface ProgressStatsResponse {
  success: boolean;
  stats?: ProgressStats;
  error?: string;
}

export interface JournalStreakResponse {
  success: boolean;
  currentStreak?: number;
  error?: string;
}

export interface AIPromptResponse {
  success: boolean;
  prompts?: string[];
  error?: string;
}
