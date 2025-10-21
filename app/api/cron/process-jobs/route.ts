/**
 * POST /api/cron/process-jobs
 * Cron endpoint to process background jobs
 *
 * This should be called by a scheduled task (e.g., Vercel Cron, GitHub Actions, etc.)
 * Add authentication via cron secret for production use
 */

import { NextRequest, NextResponse } from 'next/server';
import { processExportRequests } from '@/lib/jobs/process-exports';
import { processDeletionRequests } from '@/lib/jobs/process-deletions';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify cron secret (production security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting background job processing...');

    // 2. Process export requests
    try {
      await processExportRequests();
    } catch (err) {
      console.error('[Cron] Export processing error:', err);
    }

    // 3. Process deletion requests
    try {
      await processDeletionRequests();
    } catch (err) {
      console.error('[Cron] Deletion processing error:', err);
    }

    console.log('[Cron] Background job processing complete');

    // 4. Return success
    return NextResponse.json(
      {
        ok: true,
        message: 'Jobs processed successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Cron] Job processing error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: 'Cron endpoint is healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
