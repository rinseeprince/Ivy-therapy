/**
 * Background Job: Process Export Requests
 * Generates JSON export files and uploads to storage
 */

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { uploadExportData } from '@/lib/storage';
import { logExportReady, logExportFailed } from '@/lib/audit';
import type { UserDataExport } from '@/types/database';

/**
 * Process pending export requests
 * This should be called by a cron job or scheduled task
 */
export async function processExportRequests() {
  const supabase = await getSupabaseServiceClient();

  console.log('[Export Job] Starting export processing...');

  // 1. Get all queued export requests
  const { data: exports, error: fetchError } = await supabase
    .from('data_exports')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(10); // Process 10 at a time

  if (fetchError) {
    console.error('[Export Job] Failed to fetch queued exports:', fetchError);
    return;
  }

  if (!exports || exports.length === 0) {
    console.log('[Export Job] No queued exports found');
    return;
  }

  console.log(`[Export Job] Processing ${exports.length} export(s)`);

  // 2. Process each export
  for (const exportRequest of exports) {
    try {
      // Mark as processing
      await supabase
        .from('data_exports')
        .update({ status: 'processing' })
        .eq('id', exportRequest.id);

      console.log(`[Export Job] Processing export ${exportRequest.id} for user ${exportRequest.user_id}`);

      // 3. Generate export data
      const exportData = await generateUserExport(exportRequest.user_id);

      // 4. Upload to storage
      const filePath = await uploadExportData(
        exportRequest.user_id,
        exportRequest.id,
        exportData
      );

      // 5. Update export record
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      await supabase
        .from('data_exports')
        .update({
          status: 'ready',
          file_path: filePath,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', exportRequest.id);

      // 6. Log success
      await logExportReady(exportRequest.user_id, exportRequest.id);

      console.log(`[Export Job] Export ${exportRequest.id} completed successfully`);
    } catch (err) {
      console.error(`[Export Job] Failed to process export ${exportRequest.id}:`, err);

      // Mark as failed
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await supabase
        .from('data_exports')
        .update({
          status: 'failed',
          error: errorMessage,
        })
        .eq('id', exportRequest.id);

      await logExportFailed(exportRequest.user_id, exportRequest.id, errorMessage);
    }
  }

  console.log('[Export Job] Export processing complete');
}

/**
 * Generate user data export
 */
async function generateUserExport(userId: string): Promise<UserDataExport> {
  const supabase = await getSupabaseServiceClient();

  // 1. Get user data
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !user) {
    throw new Error('User not found');
  }

  // 2. Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 3. Get consent records
  const { data: consents } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // 4. Get therapy sessions with messages
  const { data: sessions } = await supabase
    .from('therapy_sessions')
    .select(`
      *,
      session_summaries (*),
      action_items (*)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  // 5. Format conversations
  const conversations = (sessions || []).map((session: any) => ({
    id: session.id,
    created_at: session.started_at,
    status: session.status,
    duration_minutes: session.duration_minutes,
    messages: (session.transcript || []).map((msg: any, index: number) => ({
      id: `${session.id}-${index}`,
      role: msg.role,
      content: msg.content,
      created_at: msg.timestamp || session.started_at,
    })),
    summaries: (session.session_summaries || []).map((summary: any) => ({
      id: summary.id,
      text: summary.summary,
      key_topics: summary.key_topics,
      created_at: summary.created_at,
    })),
    action_items: (session.action_items || []).map((item: any) => ({
      id: item.id,
      text: item.item,
      due_date: item.due_date,
      completed: item.completed,
      created_at: item.created_at,
    })),
  }));

  // 6. Build export object
  const exportData: UserDataExport = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    user: {
      id: user.user.id,
      email: user.user.email || '',
      created_at: user.user.created_at,
    },
    settings: {
      data_retention_days: settings?.data_retention_days || 365,
      has_active_consent: settings?.has_active_consent || false,
      consent_version: settings?.consent_version,
    },
    consents: (consents || []).map((consent) => ({
      created_at: consent.created_at,
      version: consent.consent_version,
      locale: consent.locale,
    })),
    conversations,
  };

  return exportData;
}
