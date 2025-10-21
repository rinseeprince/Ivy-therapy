# Consent & Data Management Features

Production-ready implementation of consent management and GDPR-compliant data export/deletion for the AI Therapy Platform.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Database Migrations](#database-migrations)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Background Jobs](#background-jobs)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Compliance](#compliance)
- [Troubleshooting](#troubleshooting)

## Overview

This implementation provides two critical production features:

1. **Consent + Scope Gate**: First-run consent flow with clear limitations, age restrictions, and emergency information
2. **Account Deletion & Data Export**: Self-service GDPR-friendly data portability and right-to-deletion

## Features

### Consent System

- ✅ Blocking modal/page on first run
- ✅ Plain-language scope limitations and emergency info
- ✅ Required checkboxes for all consent items
- ✅ Version tracking with content hashing
- ✅ Internationalization support (en-GB, en-US)
- ✅ IP address and user agent logging for audit
- ✅ Revocation capability with re-blocking
- ✅ Accessibility (keyboard navigation, ARIA labels)

### Data Export

- ✅ Self-service JSON export request
- ✅ Background job processing
- ✅ Signed download URLs (24h expiry)
- ✅ Rate limiting (1 export per 24h)
- ✅ Re-authentication required
- ✅ Complete data export including:
  - User profile
  - Consent records
  - Therapy sessions & transcripts
  - Summaries & action items
  - Settings

### Account Deletion

- ✅ Self-service deletion request
- ✅ Re-authentication required
- ✅ Typed confirmation ("DELETE")
- ✅ Cascading deletion of all user data
- ✅ Immediate or grace period options
- ✅ Audit trail preservation
- ✅ Safe background processing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  ConsentModal/Page  │  AuthGuard  │  Manage Data Page       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       API Routes                             │
├─────────────────────────────────────────────────────────────┤
│  /api/consent/*  │  /api/auth/reauth  │  /api/data/*        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Helper Libraries                          │
├─────────────────────────────────────────────────────────────┤
│  lib/consent.ts  │  lib/audit.ts  │  lib/auth.ts  │         │
│  lib/storage.ts                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (Postgres)                       │
├─────────────────────────────────────────────────────────────┤
│  user_consents  │  user_settings  │  data_exports  │        │
│  deletion_requests  │  privacy_audit                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Background Jobs (Cron)                     │
├─────────────────────────────────────────────────────────────┤
│  process-exports.ts  │  process-deletions.ts                │
└─────────────────────────────────────────────────────────────┘
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Supabase CLI (for migrations)

### Installation Steps

1. **Install Dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

2. **Set Environment Variables**

Create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cron Secret (for production)
CRON_SECRET=your-random-secret-string
```

3. **Initialize Storage Bucket**

The exports storage bucket needs to be created. You can do this via Supabase dashboard or CLI:

```sql
-- Via SQL editor in Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-exports',
  'data-exports',
  false,
  52428800,  -- 50MB
  ARRAY['application/json']
);
```

Or programmatically (will be auto-created on first export if using the helper):

```typescript
import { initializeExportsBucket } from '@/lib/storage';
await initializeExportsBucket();
```

## Database Migrations

### Running Migrations

**Option 1: Supabase CLI (Recommended)**

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push

# Or apply specific migration
supabase migration up
```

**Option 2: SQL Editor**

Copy the contents of `supabase/migrations/20250121_consent_and_data_management.sql` and run it in your Supabase SQL editor.

### Migration Contents

The migration creates:

- `user_consents` - Consent records with versioning
- `user_settings` - User preferences and consent status
- `data_exports` - Export request tracking
- `deletion_requests` - Deletion request tracking
- `privacy_audit` - Privacy-preserving audit log
- RLS policies for owner-only access
- Helper functions and triggers

### Verification

After migration, verify tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_consents',
  'user_settings',
  'data_exports',
  'deletion_requests',
  'privacy_audit'
);
```

## Configuration

### Consent Text Customization

Edit `lib/consent.ts` to customize consent text for different locales:

```typescript
export const CONSENT_TEXT = {
  'en-GB': {
    title: 'About this app',
    bullets: [
      'Your custom text here...',
    ],
    // ...
  },
};
```

After changing consent text, update the version:

```typescript
export const CURRENT_CONSENT_VERSION = 'v1.1'; // Increment version
```

### Rate Limiting

Configure export rate limits in `/api/data/export/request/route.ts`:

```typescript
const EXPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
```

### Re-authentication Timeout

Configure reauth validity in `lib/auth.ts`:

```typescript
const REAUTH_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes
```

### Cron Schedule

Configure job frequency in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

## Usage

### For Users

1. **First-Time Consent**
   - New users are redirected to `/consent` on first access to protected pages
   - All checkboxes must be checked to proceed
   - Consent is versioned and tracked

2. **Data Export**
   - Navigate to `/settings/manage-data`
   - Click "Request Data Export"
   - Re-authenticate with password
   - Wait for processing (usually 1-5 minutes)
   - Download JSON file (valid for 24 hours)

3. **Account Deletion**
   - Navigate to `/settings/manage-data`
   - Click "Delete My Account"
   - Re-authenticate with password
   - Type "DELETE" to confirm
   - Provide optional reason
   - Account and data are permanently deleted

### For Developers

#### Check Consent Status

```typescript
import { hasActiveConsent } from '@/lib/auth';

const userId = 'user-id';
const hasConsent = await hasActiveConsent(userId);
```

#### Require Consent on Pages

```typescript
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard requireConsent={true}>
      {/* Your content */}
    </AuthGuard>
  );
}
```

#### Log Audit Events

```typescript
import { logAuditEvent } from '@/lib/audit';

await logAuditEvent(
  userId,
  'custom.event',
  { metadata: 'value' }
);
```

## API Reference

### Consent APIs

#### POST /api/consent/accept
Accept user consent

**Request:**
```json
{
  "consentVersion": "v1.0",
  "consentTextHash": "sha256-...",
  "acknowledgedAiLimitations": true,
  "confirmedNotEmergency": true,
  "confirmedAgeOver18": true,
  "acceptedTermsPrivacy": true,
  "locale": "en-GB"
}
```

**Response:**
```json
{
  "ok": true
}
```

#### POST /api/consent/revoke
Revoke user consent

**Response:**
```json
{
  "ok": true
}
```

### Data Export APIs

#### POST /api/data/export/request
Request data export (requires re-auth)

**Response:**
```json
{
  "ok": true,
  "exportId": "uuid"
}
```

#### GET /api/data/export/status
Get latest export status

**Response:**
```json
{
  "ok": true,
  "export": {
    "id": "uuid",
    "status": "ready",
    "expires_at": "2025-01-22T12:00:00Z"
  }
}
```

#### GET /api/data/export/download?exportId=uuid
Get download URL for export

**Response:**
```json
{
  "ok": true,
  "url": "https://signed-url..."
}
```

### Account Deletion APIs

#### POST /api/data/delete/request
Request account deletion (requires re-auth)

**Request:**
```json
{
  "reason": "Optional reason",
  "confirmationPhrase": "DELETE"
}
```

**Response:**
```json
{
  "ok": true,
  "requestId": "uuid"
}
```

#### GET /api/data/delete/status
Get latest deletion status

**Response:**
```json
{
  "ok": true,
  "request": {
    "id": "uuid",
    "status": "processing"
  }
}
```

### Authentication APIs

#### POST /api/auth/reauth
Re-authenticate for sensitive operations

**Request:**
```json
{
  "password": "user-password"
}
```

**Response:**
```json
{
  "ok": true
}
```

## Background Jobs

### Job Processor

The cron endpoint `/api/cron/process-jobs` handles both exports and deletions.

**Local Testing:**

```bash
# Call the cron endpoint manually
curl -X POST http://localhost:3000/api/cron/process-jobs \
  -H "Authorization: Bearer your-cron-secret"
```

**Production Setup (Vercel):**

Vercel Cron is configured via `vercel.json`. Jobs run automatically every 5 minutes.

**Alternative: Manual Scheduling**

For non-Vercel deployments, set up a cron job:

```bash
*/5 * * * * curl -X POST https://your-domain.com/api/cron/process-jobs \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Job Monitoring

Check logs for job execution:

```bash
# Vercel
vercel logs --follow

# Local
npm run dev  # Watch console output
```

## Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test consent.test.ts

# Watch mode
npm test -- --watch
```

### Test Files

- `__tests__/consent.test.ts` - Consent validation and text generation
- `__tests__/audit.test.ts` - Audit logging event types

### Manual Testing Checklist

- [ ] New user sees consent modal/page
- [ ] Cannot proceed without checking all boxes
- [ ] Consent recorded in database with version
- [ ] Can revoke consent and access is blocked
- [ ] Export request creates queued job
- [ ] Export processes and becomes ready
- [ ] Download URL works and expires after 24h
- [ ] Re-auth required before export/delete
- [ ] Deletion requires "DELETE" confirmation
- [ ] Deletion removes all user data
- [ ] Audit events logged for all actions

## Security Considerations

### Authentication

- All API routes require authenticated user
- Sensitive operations (export/delete) require recent re-auth (10 min window)
- Re-auth cookie is HTTP-only and secure

### Rate Limiting

- Exports limited to 1 per 24 hours per user
- Consider adding IP-based rate limiting for production

### RLS Policies

- All tables have Row-Level Security enabled
- Users can only access their own data
- Service role required for background jobs

### Data Protection

- Exports stored in private storage bucket
- Signed URLs expire after 24 hours
- No raw passwords stored or logged
- IP addresses stored for consent audit (GDPR-compliant)

### Cron Security

- Cron endpoint protected by secret token
- Use `CRON_SECRET` environment variable
- Rotate secret periodically

## Compliance

### GDPR

- ✅ Right to access (data export)
- ✅ Right to erasure (account deletion)
- ✅ Right to data portability (JSON format)
- ✅ Consent management with withdrawal
- ✅ Audit trail for data processing
- ✅ Purpose limitation (consent text)

### App Store Requirements

- ✅ Age gate (18+)
- ✅ Clear scope limitations
- ✅ Emergency contact information
- ✅ Privacy Policy reference
- ✅ Data deletion capability
- ✅ Consent before data collection

### Privacy Best Practices

- Minimal data collection
- No message content in audit logs
- Secure data transmission (HTTPS)
- Regular data retention review
- User control over data

## Troubleshooting

### Consent not persisting

**Check:**
1. Database migration applied?
2. RLS policies created?
3. User authenticated?
4. Browser cookies enabled?

**Fix:**
```bash
# Re-run migration
supabase db reset
supabase db push
```

### Export stuck in "queued"

**Check:**
1. Cron job running?
2. Service role key configured?
3. Storage bucket created?

**Fix:**
```bash
# Manually trigger job
curl -X POST http://localhost:3000/api/cron/process-jobs \
  -H "Authorization: Bearer $CRON_SECRET"

# Check logs
vercel logs --follow
```

### Deletion not completing

**Check:**
1. Foreign key constraints?
2. Service role permissions?
3. Background job errors?

**Fix:**
```sql
-- Check deletion requests
SELECT * FROM deletion_requests WHERE status = 'failed';

-- View error details
SELECT id, status, reason FROM deletion_requests ORDER BY created_at DESC LIMIT 10;
```

### Re-auth not working

**Check:**
1. Cookie domain/path correct?
2. Timestamp not expired?
3. Password verification method?

**Fix:**
```typescript
// Check cookie in browser DevTools
// Application > Cookies > reauth_timestamp

// Clear and retry
document.cookie = 'reauth_timestamp=; Max-Age=0';
```

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check Supabase logs
4. Review browser console
5. Check server logs

## License

This implementation is part of the AI Therapy Platform and follows the same license.
