/**
 * POST /api/data/delete/request
 * Request account and data deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthAndReauth } from '@/lib/auth';
import { logDeleteRequested } from '@/lib/audit';
import type { DeleteAccountRequest, DeleteAccountResponse, DeletionRequestInsert } from '@/types/database';

// Request validation schema
const DeleteRequestSchema = z.object({
  reason: z.string().optional(),
  confirmationPhrase: z.string().refine(
    (val) => val === 'DELETE',
    { message: 'You must type "DELETE" to confirm' }
  ),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication and recent re-auth
    const user = await requireAuthAndReauth();

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = DeleteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`,
        } as DeleteAccountResponse,
        { status: 400 }
      );
    }

    const data = validation.data as DeleteAccountRequest;

    // 3. Check for existing pending deletion request
    const supabase = await getSupabaseServerClient();

    const { data: existingRequest, error: checkError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['queued', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Failed to check existing deletion requests:', checkError);
      return NextResponse.json(
        { ok: false, error: 'Failed to check existing requests' } as DeleteAccountResponse,
        { status: 500 }
      );
    }

    if (existingRequest && existingRequest.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You already have a pending deletion request',
          requestId: existingRequest[0].id,
        } as DeleteAccountResponse,
        { status: 409 }
      );
    }

    // 4. Create deletion request
    const deletionRequest: DeletionRequestInsert = {
      user_id: user.id,
      status: 'queued',
      reason: data.reason || null,
      confirmation_phrase: data.confirmationPhrase,
    };

    const { data: newRequest, error: insertError } = await supabase
      .from('deletion_requests')
      .insert(deletionRequest)
      .select()
      .single();

    if (insertError || !newRequest) {
      console.error('Failed to create deletion request:', insertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create deletion request' } as DeleteAccountResponse,
        { status: 500 }
      );
    }

    // 5. IMMEDIATELY mark account as pending deletion
    // This blocks all access and appears deleted to the user
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({
        pending_deletion: true,
        deletion_requested_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Failed to mark account for deletion:', settingsError);
      // Continue anyway - deletion request is queued
    }

    // 6. Log audit event
    await logDeleteRequested(user.id, newRequest.id, data.reason);

    // 7. Sign out the user by invalidating session
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Failed to sign out user:', signOutError);
      // Continue anyway - frontend will handle logout
    }

    // 8. Success response (user sees "Account deleted successfully")
    return NextResponse.json(
      {
        ok: true,
        requestId: newRequest.id,
      } as DeleteAccountResponse,
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Re-authentication required') {
      return NextResponse.json(
        { ok: false, error: 'Re-authentication required' } as DeleteAccountResponse,
        { status: 401 }
      );
    }

    console.error('Delete request error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as DeleteAccountResponse,
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
