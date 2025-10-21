/**
 * Background Job: Process Deletion Requests
 * Permanently deletes user accounts and all associated data
 */

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { deleteAllUserExports } from '@/lib/storage';
import { logDeleteProcessing, logDeleteCompleted, logDeleteFailed } from '@/lib/audit';

/**
 * Process pending deletion requests
 * This should be called by a cron job or scheduled task
 */
export async function processDeletionRequests() {
  const supabase = await getSupabaseServiceClient();

  console.log('[Deletion Job] Starting deletion processing...');

  // 1. Get all queued deletion requests
  const { data: deletions, error: fetchError } = await supabase
    .from('deletion_requests')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(5); // Process 5 at a time (slower to be safe)

  if (fetchError) {
    console.error('[Deletion Job] Failed to fetch queued deletions:', fetchError);
    return;
  }

  if (!deletions || deletions.length === 0) {
    console.log('[Deletion Job] No queued deletions found');
    return;
  }

  console.log(`[Deletion Job] Processing ${deletions.length} deletion(s)`);

  // 2. Process each deletion
  for (const deletionRequest of deletions) {
    try {
      // Mark as processing
      await supabase
        .from('deletion_requests')
        .update({ status: 'processing' })
        .eq('id', deletionRequest.id);

      console.log(`[Deletion Job] Processing deletion ${deletionRequest.id} for user ${deletionRequest.user_id}`);

      // Log processing start
      await logDeleteProcessing(deletionRequest.user_id, deletionRequest.id);

      // 3. Delete user data (order matters for foreign keys)
      await deleteUserData(deletionRequest.user_id);

      // 4. Update deletion record to completed
      await supabase
        .from('deletion_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', deletionRequest.id);

      // 5. Log completion (user_id may be null if user already deleted)
      await logDeleteCompleted(null, deletionRequest.id);

      console.log(`[Deletion Job] Deletion ${deletionRequest.id} completed successfully`);
    } catch (err) {
      console.error(`[Deletion Job] Failed to process deletion ${deletionRequest.id}:`, err);

      // Mark as failed
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await supabase
        .from('deletion_requests')
        .update({
          status: 'failed',
          reason: errorMessage,
        })
        .eq('id', deletionRequest.id);

      await logDeleteFailed(deletionRequest.user_id, deletionRequest.id, errorMessage);
    }
  }

  console.log('[Deletion Job] Deletion processing complete');
}

/**
 * Delete all user data
 * CAUTION: This permanently deletes data and cannot be undone
 */
async function deleteUserData(userId: string) {
  const supabase = await getSupabaseServiceClient();

  console.log(`[Deletion] Starting data deletion for user ${userId}`);

  // 1. Delete therapy session related data
  // Delete action items (they reference sessions)
  const { error: actionItemsError } = await supabase
    .from('action_items')
    .delete()
    .eq('user_id', userId);

  if (actionItemsError) {
    console.error('[Deletion] Failed to delete action items:', actionItemsError);
  }

  // Delete session summaries
  const { data: sessions } = await supabase
    .from('therapy_sessions')
    .select('id')
    .eq('user_id', userId);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id);
    const { error: summariesError } = await supabase
      .from('session_summaries')
      .delete()
      .in('session_id', sessionIds);

    if (summariesError) {
      console.error('[Deletion] Failed to delete session summaries:', summariesError);
    }
  }

  // Delete therapy sessions
  const { error: sessionsError } = await supabase
    .from('therapy_sessions')
    .delete()
    .eq('user_id', userId);

  if (sessionsError) {
    console.error('[Deletion] Failed to delete therapy sessions:', sessionsError);
  }

  // 2. Delete export files from storage
  try {
    await deleteAllUserExports(userId);
  } catch (storageErr) {
    console.error('[Deletion] Failed to delete export files:', storageErr);
  }

  // 3. Delete data exports records
  const { error: exportsError } = await supabase
    .from('data_exports')
    .delete()
    .eq('user_id', userId);

  if (exportsError) {
    console.error('[Deletion] Failed to delete export records:', exportsError);
  }

  // 4. Delete user settings
  const { error: settingsError } = await supabase
    .from('user_settings')
    .delete()
    .eq('user_id', userId);

  if (settingsError) {
    console.error('[Deletion] Failed to delete user settings:', settingsError);
  }

  // 5. Delete consent records
  const { error: consentsError } = await supabase
    .from('user_consents')
    .delete()
    .eq('user_id', userId);

  if (consentsError) {
    console.error('[Deletion] Failed to delete consent records:', consentsError);
  }

  // 6. Delete privacy audit logs (keep minimal operational data)
  // Note: Consider keeping these for compliance, or anonymize instead of delete
  const { error: auditError } = await supabase
    .from('privacy_audit')
    .delete()
    .eq('user_id', userId);

  if (auditError) {
    console.error('[Deletion] Failed to delete audit logs:', auditError);
  }

  // 7. Delete deletion requests (except current one)
  const { error: deletionReqError } = await supabase
    .from('deletion_requests')
    .delete()
    .eq('user_id', userId)
    .neq('status', 'processing'); // Keep the current processing request

  if (deletionReqError) {
    console.error('[Deletion] Failed to delete old deletion requests:', deletionReqError);
  }

  // 8. Delete auth user (final step)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('[Deletion] Failed to delete auth user:', authError);
    throw new Error(`Failed to delete user account: ${authError.message}`);
  }

  console.log(`[Deletion] Data deletion completed for user ${userId}`);
}

/**
 * Cancel a deletion request (before processing)
 */
export async function cancelDeletionRequest(userId: string, requestId: string) {
  const supabase = await getSupabaseServiceClient();

  const { error } = await supabase
    .from('deletion_requests')
    .update({ status: 'canceled' })
    .eq('id', requestId)
    .eq('user_id', userId)
    .eq('status', 'queued'); // Only cancel queued requests

  if (error) {
    throw new Error(`Failed to cancel deletion request: ${error.message}`);
  }
}
