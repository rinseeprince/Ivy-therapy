/**
 * POST /api/data/delete/confirm
 * Confirm and immediately process deletion (optional - for immediate deletion)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthAndReauth } from '@/lib/auth';

interface ConfirmDeleteResponse {
  ok: boolean;
  error?: string;
}

const ConfirmDeleteSchema = z.object({
  requestId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication and recent re-auth
    const user = await requireAuthAndReauth();

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = ConfirmDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`,
        } as ConfirmDeleteResponse,
        { status: 400 }
      );
    }

    const { requestId } = validation.data;

    // 3. Verify deletion request exists and belongs to user
    const supabase = await getSupabaseServerClient();

    const { data: deletionRequest, error: fetchError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !deletionRequest) {
      return NextResponse.json(
        { ok: false, error: 'Deletion request not found' } as ConfirmDeleteResponse,
        { status: 404 }
      );
    }

    // 4. Check if request is in valid state for confirmation
    if (deletionRequest.status !== 'queued') {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot confirm deletion in status: ${deletionRequest.status}`,
        } as ConfirmDeleteResponse,
        { status: 400 }
      );
    }

    // 5. Update request to processing (background job will handle actual deletion)
    // Note: Actual deletion is handled by background worker for safety
    const { error: updateError } = await supabase
      .from('deletion_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update deletion request:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to confirm deletion' } as ConfirmDeleteResponse,
        { status: 500 }
      );
    }

    // 6. Success response
    // Note: The background job will process this and actually delete the data
    return NextResponse.json(
      {
        ok: true,
      } as ConfirmDeleteResponse,
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Re-authentication required') {
      return NextResponse.json(
        { ok: false, error: 'Re-authentication required' } as ConfirmDeleteResponse,
        { status: 401 }
      );
    }

    console.error('Delete confirm error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as ConfirmDeleteResponse,
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
