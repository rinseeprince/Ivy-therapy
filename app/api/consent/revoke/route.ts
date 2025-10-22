/**
 * POST /api/consent/revoke
 * Revoke user consent and block app access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserSettings, upsertUserSettings } from '@/lib/auth';
import { logConsentRevoked } from '@/lib/audit';
import type { ConsentRevokeResponse } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as ConsentRevokeResponse,
        { status: 401 }
      );
    }

    // 2. Get current consent version for audit
    const settings = await getUserSettings(user.id);
    const currentVersion = settings.consent_version || 'unknown';

    // 3. Revoke consent by updating user settings
    try {
      await upsertUserSettings(user.id, {
        has_active_consent: false,
        consent_version: undefined,
      });
    } catch (err) {
      console.error('Failed to revoke consent:', err);
      return NextResponse.json(
        { ok: false, error: 'Failed to revoke consent' } as ConsentRevokeResponse,
        { status: 500 }
      );
    }

    // 4. Log audit event
    await logConsentRevoked(user.id, currentVersion);

    // 5. Success response
    return NextResponse.json(
      { ok: true } as ConsentRevokeResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Consent revoke error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as ConsentRevokeResponse,
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
