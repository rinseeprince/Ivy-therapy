/**
 * GET /api/data/export/download?exportId=...
 * Download or get signed URL for data export
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { getExportDownloadUrl } from '@/lib/storage';
import { logExportDownloaded } from '@/lib/audit';
import type { DataExportDownloadResponse } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as DataExportDownloadResponse,
        { status: 401 }
      );
    }

    // 2. Get export ID from query params
    const { searchParams } = new URL(request.url);
    const exportId = searchParams.get('exportId');

    if (!exportId) {
      return NextResponse.json(
        { ok: false, error: 'Export ID is required' } as DataExportDownloadResponse,
        { status: 400 }
      );
    }

    // 3. Fetch export record and verify ownership
    const supabase = await getSupabaseServerClient();

    const { data: exportRecord, error: fetchError } = await supabase
      .from('data_exports')
      .select('*')
      .eq('id', exportId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !exportRecord) {
      return NextResponse.json(
        { ok: false, error: 'Export not found' } as DataExportDownloadResponse,
        { status: 404 }
      );
    }

    // 4. Check export status
    if (exportRecord.status !== 'ready') {
      return NextResponse.json(
        {
          ok: false,
          error: `Export is ${exportRecord.status}. Please wait for it to be ready.`,
        } as DataExportDownloadResponse,
        { status: 400 }
      );
    }

    // 5. Check if export has expired
    if (exportRecord.expires_at) {
      const expiryTime = new Date(exportRecord.expires_at).getTime();
      const now = Date.now();

      if (now > expiryTime) {
        return NextResponse.json(
          { ok: false, error: 'Export has expired. Please request a new export.' } as DataExportDownloadResponse,
          { status: 410 }
        );
      }
    }

    // 6. Get file path
    if (!exportRecord.file_path) {
      return NextResponse.json(
        { ok: false, error: 'Export file not found' } as DataExportDownloadResponse,
        { status: 404 }
      );
    }

    // 7. Generate signed download URL
    try {
      const downloadUrl = await getExportDownloadUrl(exportRecord.file_path);

      // 8. Log download event
      await logExportDownloaded(user.id, exportId);

      // 9. Success response with signed URL
      return NextResponse.json(
        {
          ok: true,
          url: downloadUrl,
        } as DataExportDownloadResponse,
        { status: 200 }
      );
    } catch (storageErr) {
      console.error('Failed to generate download URL:', storageErr);
      return NextResponse.json(
        { ok: false, error: 'Failed to generate download link' } as DataExportDownloadResponse,
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Export download error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as DataExportDownloadResponse,
      { status: 500 }
    );
  }
}
