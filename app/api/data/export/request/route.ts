/**
 * POST /api/data/export/request
 * Request a data export (queues job for background processing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthAndReauth, getUserSettings } from '@/lib/auth';
import { logExportRequested } from '@/lib/audit';
import type { DataExportRequestResponse, DataExportInsert } from '@/types/database';

// Rate limit: one export per 24 hours
const EXPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication and recent re-auth
    const user = await requireAuthAndReauth();

    // 2. Check if user has consent and export is allowed
    const settings = await getUserSettings(user.id);
    if (!settings.has_active_consent) {
      return NextResponse.json(
        { ok: false, error: 'Active consent required' } as DataExportRequestResponse,
        { status: 403 }
      );
    }

    if (!settings.allow_data_export) {
      return NextResponse.json(
        { ok: false, error: 'Data export is not enabled for your account' } as DataExportRequestResponse,
        { status: 403 }
      );
    }

    // 3. Check rate limit - prevent spam requests
    const supabase = await getSupabaseServerClient();

    const { data: recentExports, error: checkError } = await supabase
      .from('data_exports')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Failed to check recent exports:', checkError);
      return NextResponse.json(
        { ok: false, error: 'Failed to check export eligibility' } as DataExportRequestResponse,
        { status: 500 }
      );
    }

    if (recentExports && recentExports.length > 0) {
      const lastExportTime = new Date(recentExports[0].created_at).getTime();
      const now = Date.now();

      if (now - lastExportTime < EXPORT_COOLDOWN_MS) {
        const hoursLeft = Math.ceil((EXPORT_COOLDOWN_MS - (now - lastExportTime)) / (60 * 60 * 1000));
        return NextResponse.json(
          {
            ok: false,
            error: `Please wait ${hoursLeft} hours before requesting another export`,
          } as DataExportRequestResponse,
          { status: 429 }
        );
      }
    }

    // 4. Create export request
    const exportRequest: DataExportInsert = {
      user_id: user.id,
      status: 'queued',
    };

    const { data: newExport, error: insertError } = await supabase
      .from('data_exports')
      .insert(exportRequest)
      .select()
      .single();

    if (insertError || !newExport) {
      console.error('Failed to create export request:', insertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create export request' } as DataExportRequestResponse,
        { status: 500 }
      );
    }

    // 5. Log audit event
    await logExportRequested(user.id, newExport.id);

    // 6. Success response
    return NextResponse.json(
      {
        ok: true,
        exportId: newExport.id,
      } as DataExportRequestResponse,
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Re-authentication required') {
      return NextResponse.json(
        { ok: false, error: 'Re-authentication required' } as DataExportRequestResponse,
        { status: 401 }
      );
    }

    console.error('Export request error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as DataExportRequestResponse,
      { status: 500 }
    );
  }
}

// Prevent GET requests
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
