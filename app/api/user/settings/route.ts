/**
 * GET /api/user/settings
 * Get user settings including consent status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserSettings } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get user settings
    const settings = await getUserSettings(user.id);

    // 3. Return settings
    return NextResponse.json(
      {
        ok: true,
        settings,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('User settings error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
