/**
 * POST /api/auth/reauth
 * Re-authenticate user before sensitive operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, verifyPassword, setReauthCookie } from '@/lib/auth';
import { logReauth } from '@/lib/audit';

// Request validation schema
const ReauthSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

interface ReauthResponse {
  ok: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' } as ReauthResponse,
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = ReauthSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`,
        } as ReauthResponse,
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // 3. Verify password
    const isValid = await verifyPassword(password);

    if (!isValid) {
      // Log failed attempt
      await logReauth(user.id, false, 'password');

      return NextResponse.json(
        { ok: false, error: 'Invalid password' } as ReauthResponse,
        { status: 401 }
      );
    }

    // 4. Set re-auth cookie (valid for 10 minutes)
    await setReauthCookie();

    // 5. Log successful re-auth
    await logReauth(user.id, true, 'password');

    // 6. Success response
    return NextResponse.json(
      { ok: true } as ReauthResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Re-auth error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' } as ReauthResponse,
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
