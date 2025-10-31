# Login Redirect Changes

## Summary

Updated all authentication redirects to point to `/dashboard` instead of `/session/new`.

## Changes Made

### 1. Login Page
**File:** `app/auth/login/page.tsx`
**Line:** 31
**Change:**
```typescript
// Before
router.push('/session/new')

// After
router.push('/dashboard')
```

### 2. Auth Callback (Email Confirmation)
**File:** `app/auth/callback/route.ts`
**Line:** 13
**Change:**
```typescript
// Before
return NextResponse.redirect(new URL('/', request.url))

// After
return NextResponse.redirect(new URL('/dashboard', request.url))
```

### 3. Consent Page
**File:** `app/consent/page.tsx`
**Line:** 76
**Change:**
```typescript
// Before
router.push('/sessions')

// After
router.push('/dashboard')
```

## User Flow After Changes

### New Users:
1. Sign up → Email confirmation → Click link in email
2. Redirected to `/dashboard` ✅

### Existing Users:
1. Login → Redirected to `/dashboard` ✅

### Users Accepting Consent:
1. Accept consent → Redirected to `/dashboard` ✅

## What Stays the Same

- **Homepage CTA** (`/` → "Get the app" button) still goes to `/session/new`
  - This is intentional for marketing purposes
  - Users can start a session immediately from landing page

- **Signup Flow** still shows "Check your email" page
  - No change needed here

## Navigation From Dashboard

Once users land on the dashboard, they can:
- Click **"Start New Session"** button in header → `/session/new`
- Click **"Start Session"** in sidebar → `/session/new`
- Click **"My Sessions"** in sidebar → `/sessions`
- Navigate to any other page via sidebar

## Testing

✅ Build successful - no errors
✅ All redirects updated
✅ Navigation flow tested

## Files Modified

- `app/auth/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/consent/page.tsx`

---

**Result:** Users now land on the dashboard after login instead of the start session page.
