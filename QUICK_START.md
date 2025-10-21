# Quick Start Guide: Consent & Data Management

## Installation

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

This will install the new testing dependencies:
- `vitest` - Fast unit test framework
- `@testing-library/react` - React testing utilities
- `@vitejs/plugin-react` - Vite React plugin
- `jsdom` - DOM testing environment

### 2. Environment Variables

Add to `.env.local`:

```bash
# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# New: Cron job security
CRON_SECRET=generate-a-random-secret-string
```

Generate a secure CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Database Migration

**Option A: Supabase CLI (Recommended)**

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

**Option B: SQL Editor**

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250121_consent_and_data_management.sql`
3. Run the migration

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage → Create Bucket
2. Name: `data-exports`
3. Public: **No** (keep private)
4. File size limit: 50MB
5. Allowed MIME types: `application/json`

Or run in SQL editor:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('data-exports', 'data-exports', false, 52428800, ARRAY['application/json']);
```

### 5. Set Up Cron Jobs

**For Vercel:**

The `vercel.json` is already configured. Jobs will run automatically after deployment.

**For Other Platforms:**

Set up a cron job to call:
```bash
curl -X POST https://your-domain.com/api/cron/process-jobs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Schedule: Every 5 minutes (`*/5 * * * *`)

### 6. Start Development Server

```bash
npm run dev
```

### 7. Test the Features

#### Test Consent Flow
1. Sign up or log in
2. You'll be redirected to `/consent` (first-time users)
3. Check all boxes and submit
4. Should redirect to `/sessions`

#### Test Data Export
1. Navigate to `/settings/manage-data`
2. Click "Request Data Export"
3. Re-authenticate with your password
4. Wait ~5 minutes (trigger cron manually for faster testing)
5. Download should appear

**Manual Cron Trigger (for testing):**
```bash
curl -X POST http://localhost:3000/api/cron/process-jobs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Test Account Deletion
1. Navigate to `/settings/manage-data`
2. Click "Delete My Account"
3. Re-authenticate
4. Type "DELETE" and confirm
5. Account will be queued for deletion

### 8. Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Verification Checklist

- [ ] Database migration successful
- [ ] All 5 new tables exist
- [ ] Storage bucket created
- [ ] Environment variables set
- [ ] Cron jobs configured
- [ ] Consent page loads at `/consent`
- [ ] Manage data page loads at `/settings/manage-data`
- [ ] Tests pass (`npm test`)

## File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/reauth/route.ts           # Re-authentication
│   │   ├── consent/
│   │   │   ├── accept/route.ts            # Accept consent
│   │   │   └── revoke/route.ts            # Revoke consent
│   │   ├── data/
│   │   │   ├── export/
│   │   │   │   ├── request/route.ts       # Request export
│   │   │   │   ├── status/route.ts        # Export status
│   │   │   │   └── download/route.ts      # Download export
│   │   │   └── delete/
│   │   │       ├── request/route.ts       # Request deletion
│   │   │       ├── status/route.ts        # Deletion status
│   │   │       └── confirm/route.ts       # Confirm deletion
│   │   ├── cron/process-jobs/route.ts     # Background jobs
│   │   └── user/settings/route.ts         # User settings
│   ├── consent/page.tsx                   # Consent page
│   └── settings/manage-data/page.tsx      # Data management UI
├── components/
│   ├── ConsentModal.tsx                   # Consent modal
│   ├── ConsentGuard.tsx                   # Server consent guard
│   └── auth-guard.tsx                     # Updated with consent check
├── lib/
│   ├── consent.ts                         # Consent helpers
│   ├── audit.ts                           # Audit logging
│   ├── auth.ts                            # Auth & reauth helpers
│   ├── storage.ts                         # Storage helpers
│   └── jobs/
│       ├── process-exports.ts             # Export job processor
│       └── process-deletions.ts           # Deletion job processor
├── types/
│   └── database.ts                        # TypeScript types
├── __tests__/
│   ├── consent.test.ts                    # Consent tests
│   └── audit.test.ts                      # Audit tests
├── supabase/
│   └── migrations/
│       └── 20250121_consent_and_data_management.sql
├── vercel.json                            # Cron configuration
├── vitest.config.ts                       # Test configuration
├── vitest.setup.ts                        # Test setup
├── CONSENT_AND_DATA_MANAGEMENT.md         # Full documentation
└── QUICK_START.md                         # This file
```

## Next Steps

1. **Customize Consent Text**: Edit `lib/consent.ts` to customize for your needs
2. **Add More Locales**: Add translations in `CONSENT_TEXT` object
3. **Configure Rate Limits**: Adjust in API routes as needed
4. **Set Up Monitoring**: Add alerts for failed exports/deletions
5. **Review Privacy Policy**: Ensure it matches your consent text
6. **Test in Production**: Deploy to staging first

## Troubleshooting

### "Consent not found" error
- Run database migration
- Check `user_settings` table exists
- Verify RLS policies are enabled

### Export stuck in "queued"
- Check cron job is running
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check storage bucket exists
- Manually trigger: `curl -X POST .../api/cron/process-jobs`

### "Re-authentication required"
- Password must be correct
- Cookie must be set (check browser DevTools)
- Check cookie domain/path settings

### Tests failing
- Install dependencies: `npm install`
- Check Node version (18+)
- Verify `vitest.config.ts` exists

## Support

See `CONSENT_AND_DATA_MANAGEMENT.md` for:
- Detailed architecture
- API documentation
- Security considerations
- Compliance information
- Advanced troubleshooting

## Security Notes

⚠️ **Before Production:**

1. Set strong `CRON_SECRET`
2. Enable rate limiting on API routes
3. Review RLS policies
4. Set up error monitoring
5. Test deletion thoroughly
6. Backup database before deploying

## License

Part of the AI Therapy Platform.
