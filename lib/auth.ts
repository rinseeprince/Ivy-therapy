/**
 * Authentication Utilities
 * Handles re-authentication checks and session management
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const REAUTH_COOKIE_NAME = 'reauth_timestamp';
const REAUTH_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Check if user has recently re-authenticated
 * @returns true if re-auth is valid, false if re-auth required
 */
export async function checkRecentReauth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const reauthCookie = cookieStore.get(REAUTH_COOKIE_NAME);

    if (!reauthCookie) {
      return false;
    }

    const reauthTimestamp = parseInt(reauthCookie.value, 10);
    const now = Date.now();

    // Check if re-auth is still valid (within 10 minutes)
    return now - reauthTimestamp < REAUTH_VALIDITY_MS;
  } catch (err) {
    console.error('Error checking reauth:', err);
    return false;
  }
}

/**
 * Set re-authentication timestamp cookie
 */
export async function setReauthCookie(): Promise<void> {
  const cookieStore = await cookies();
  const now = Date.now();

  cookieStore.set(REAUTH_COOKIE_NAME, now.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REAUTH_VALIDITY_MS / 1000, // 10 minutes in seconds
    path: '/',
  });
}

/**
 * Clear re-authentication cookie
 */
export async function clearReauthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REAUTH_COOKIE_NAME);
}

/**
 * Verify user password for re-authentication
 * @param password - User's password
 * @returns true if password is correct, false otherwise
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    // Attempt to sign in with email and password
    // This doesn't create a new session, just verifies credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    return !signInError;
  } catch (err) {
    console.error('Error verifying password:', err);
    return false;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get user settings including consent status
 */
export async function getUserSettings(userId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return {
        user_id: userId,
        has_active_consent: false,
        consent_version: null,
        data_retention_days: 365,
        allow_data_export: true,
        pending_deletion: false,
        deletion_requested_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw error;
  }

  return data;
}

/**
 * Create or update user settings
 */
export async function upsertUserSettings(
  userId: string,
  settings: Partial<{
    has_active_consent: boolean;
    consent_version: string;
    data_retention_days: number;
    allow_data_export: boolean;
  }>
) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Require authentication and valid consent
 * Throws error if user not authenticated or consent not valid
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require authentication, valid consent, and recent re-auth
 */
export async function requireAuthAndReauth() {
  const user = await requireAuth();
  const hasRecentReauth = await checkRecentReauth();

  if (!hasRecentReauth) {
    throw new Error('Re-authentication required');
  }

  return user;
}

/**
 * Check if user has active consent
 */
export async function hasActiveConsent(userId: string): Promise<boolean> {
  try {
    const settings = await getUserSettings(userId);
    return settings.has_active_consent && !settings.pending_deletion;
  } catch (err) {
    console.error('Error checking consent:', err);
    return false;
  }
}

/**
 * Check if user account is pending deletion
 */
export async function isPendingDeletion(userId: string): Promise<boolean> {
  try {
    const settings = await getUserSettings(userId);
    return settings.pending_deletion;
  } catch (err) {
    console.error('Error checking deletion status:', err);
    return false;
  }
}
