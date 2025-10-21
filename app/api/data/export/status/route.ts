/**
 * GET /api/data/export/status
 * Get status of latest data export request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import type { DataExportStatusResponse } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as DataExportStatusResponse,
        { status: 401 }
      );
    }

    // 2. Get latest export request
    const supabase = await getSupabaseServerClient();

    const { data: latestExport, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No exports found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { ok: true, export: null } as DataExportStatusResponse,
          { status: 200 }
        );
      }

      console.error('Failed to fetch export status:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch export status' } as DataExportStatusResponse,
        { status: 500 }
      );
    }

    // 3. Success response
    return NextResponse.json(
      {
        ok: true,
        export: latestExport,
      } as DataExportStatusResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Export status error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as DataExportStatusResponse,
      { status: 500 }
    );
  }
}
