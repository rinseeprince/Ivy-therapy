/**
 * POST /api/consent/accept
 * Accept user consent and enable app access
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser, upsertUserSettings } from '@/lib/auth';
import { validateConsentData, CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { logConsentAccepted } from '@/lib/audit';
import type { ConsentAcceptRequest, ConsentAcceptResponse, UserConsentInsert } from '@/types/database';

// Request validation schema
const ConsentAcceptSchema = z.object({
  consentVersion: z.string(),
  consentTextHash: z.string().startsWith('sha256-'),
  acknowledgedAiLimitations: z.boolean(),
  confirmedNotEmergency: z.boolean(),
  confirmedAgeOver18: z.boolean(),
  acceptedTermsPrivacy: z.boolean(),
  locale: z.string().default('en-GB'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as ConsentAcceptResponse,
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = ConsentAcceptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`,
        } as ConsentAcceptResponse,
        { status: 400 }
      );
    }

    const data = validation.data as ConsentAcceptRequest;

    // 3. Validate all consent checkboxes are true
    const consentValidation = validateConsentData({
      acknowledgedAiLimitations: data.acknowledgedAiLimitations,
      confirmedNotEmergency: data.confirmedNotEmergency,
      confirmedAgeOver18: data.confirmedAgeOver18,
      acceptedTermsPrivacy: data.acceptedTermsPrivacy,
    });

    if (!consentValidation.valid) {
      return NextResponse.json(
        { ok: false, error: consentValidation.errors.join(', ') } as ConsentAcceptResponse,
        { status: 400 }
      );
    }

    // 4. Get client IP and user agent for audit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // 5. Store consent record
    const supabase = await getSupabaseServerClient();

    const consentRecord: UserConsentInsert = {
      user_id: user.id,
      consent_version: data.consentVersion,
      consent_text_hash: data.consentTextHash,
      acknowledged_ai_limitations: data.acknowledgedAiLimitations,
      confirmed_not_emergency: data.confirmedNotEmergency,
      confirmed_age_over_18: data.confirmedAgeOver18,
      accepted_terms_privacy: data.acceptedTermsPrivacy,
      locale: data.locale,
      ip_inet: ip,
      user_agent: userAgent,
    };

    const { error: consentError } = await supabase
      .from('user_consents')
      .insert(consentRecord);

    if (consentError) {
      console.error('Failed to store consent:', consentError);
      return NextResponse.json(
        { ok: false, error: 'Failed to store consent record' } as ConsentAcceptResponse,
        { status: 500 }
      );
    }

    // 6. Update user settings to activate consent
    try {
      await upsertUserSettings(user.id, {
        has_active_consent: true,
        consent_version: data.consentVersion,
      });
    } catch (err) {
      console.error('Failed to update user settings:', err);
      return NextResponse.json(
        { ok: false, error: 'Failed to activate consent' } as ConsentAcceptResponse,
        { status: 500 }
      );
    }

    // 7. Log audit event
    await logConsentAccepted(user.id, data.consentVersion, data.locale);

    // 8. Success response
    return NextResponse.json(
      { ok: true } as ConsentAcceptResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Consent accept error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as ConsentAcceptResponse,
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
