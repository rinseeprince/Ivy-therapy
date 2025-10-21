/**
 * Database Types for Consent & Data Management
 * Auto-generated types matching Supabase schema
 */

export type ExportStatus = 'queued' | 'processing' | 'ready' | 'failed';
export type DeleteStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';

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
  created_at: string;
  updated_at: string;
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
