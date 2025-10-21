/**
 * Privacy Audit Logging
 * Logs privacy-sensitive actions without storing message content
 */

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import type { PrivacyAuditLogInsert } from '@/types/database';

export type AuditEvent =
  | 'consent.accepted'
  | 'consent.revoked'
  | 'consent.viewed'
  | 'export.requested'
  | 'export.ready'
  | 'export.downloaded'
  | 'export.failed'
  | 'delete.requested'
  | 'delete.processing'
  | 'delete.completed'
  | 'delete.failed'
  | 'delete.canceled'
  | 'reauth.success'
  | 'reauth.failed'
  | 'settings.updated';

export interface AuditEventDetails {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Log a privacy audit event
 * @param userId - User ID (null for system events)
 * @param event - Event type
 * @param details - Event metadata (no message content!)
 */
export async function logAuditEvent(
  userId: string | null,
  event: AuditEvent,
  details?: AuditEventDetails
): Promise<void> {
  try {
    const supabase = await getSupabaseServiceClient();

    // Use service role for audit logging (bypasses RLS)
    const { error } = await supabase
      .from('privacy_audit')
      .insert({
        user_id: userId,
        event,
        details: details || null,
      } as PrivacyAuditLogInsert);

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the main flow
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

/**
 * Log consent acceptance
 */
export async function logConsentAccepted(
  userId: string,
  version: string,
  locale: string
): Promise<void> {
  await logAuditEvent(userId, 'consent.accepted', {
    consent_version: version,
    locale,
  });
}

/**
 * Log consent revocation
 */
export async function logConsentRevoked(
  userId: string,
  version: string
): Promise<void> {
  await logAuditEvent(userId, 'consent.revoked', {
    consent_version: version,
  });
}

/**
 * Log data export request
 */
export async function logExportRequested(
  userId: string,
  exportId: string
): Promise<void> {
  await logAuditEvent(userId, 'export.requested', {
    export_id: exportId,
  });
}

/**
 * Log export ready for download
 */
export async function logExportReady(
  userId: string,
  exportId: string
): Promise<void> {
  await logAuditEvent(userId, 'export.ready', {
    export_id: exportId,
  });
}

/**
 * Log export download
 */
export async function logExportDownloaded(
  userId: string,
  exportId: string
): Promise<void> {
  await logAuditEvent(userId, 'export.downloaded', {
    export_id: exportId,
  });
}

/**
 * Log export failure
 */
export async function logExportFailed(
  userId: string,
  exportId: string,
  reason: string
): Promise<void> {
  await logAuditEvent(userId, 'export.failed', {
    export_id: exportId,
    error: reason,
  });
}

/**
 * Log account deletion request
 */
export async function logDeleteRequested(
  userId: string,
  requestId: string,
  reason?: string
): Promise<void> {
  await logAuditEvent(userId, 'delete.requested', {
    request_id: requestId,
    reason: reason || 'Not specified',
  });
}

/**
 * Log account deletion processing
 */
export async function logDeleteProcessing(
  userId: string,
  requestId: string
): Promise<void> {
  await logAuditEvent(userId, 'delete.processing', {
    request_id: requestId,
  });
}

/**
 * Log account deletion completion
 */
export async function logDeleteCompleted(
  userId: string | null,
  requestId: string
): Promise<void> {
  // userId might be null after deletion
  await logAuditEvent(userId, 'delete.completed', {
    request_id: requestId,
  });
}

/**
 * Log account deletion failure
 */
export async function logDeleteFailed(
  userId: string,
  requestId: string,
  reason: string
): Promise<void> {
  await logAuditEvent(userId, 'delete.failed', {
    request_id: requestId,
    error: reason,
  });
}

/**
 * Log re-authentication
 */
export async function logReauth(
  userId: string,
  success: boolean,
  method: string = 'password'
): Promise<void> {
  await logAuditEvent(
    userId,
    success ? 'reauth.success' : 'reauth.failed',
    { method }
  );
}

/**
 * Get audit logs for a user (requires proper permissions)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('privacy_audit')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return data;
}
