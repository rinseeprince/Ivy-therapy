/**
 * GET /api/data/delete/status
 * Get status of latest deletion request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import type { DeleteAccountStatusResponse } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as DeleteAccountStatusResponse,
        { status: 401 }
      );
    }

    // 2. Get latest deletion request
    const supabase = await getSupabaseServerClient();

    const { data: latestRequest, error } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No deletion requests found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { ok: true, request: null } as DeleteAccountStatusResponse,
          { status: 200 }
        );
      }

      console.error('Failed to fetch deletion status:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch deletion status' } as DeleteAccountStatusResponse,
        { status: 500 }
      );
    }

    // 3. Success response
    return NextResponse.json(
      {
        ok: true,
        request: latestRequest,
      } as DeleteAccountStatusResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Delete status error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as DeleteAccountStatusResponse,
      { status: 500 }
    );
  }
}
