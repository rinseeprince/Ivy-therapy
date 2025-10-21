/**
 * ConsentGuard Component
 * Server-side consent check that redirects to consent page if needed
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, hasActiveConsent } from '@/lib/auth';

interface ConsentGuardProps {
  children: React.ReactNode;
}

export async function ConsentGuard({ children }: ConsentGuardProps) {
  // 1. Check if user is authenticated
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 2. Check if user has active consent
  const consentActive = await hasActiveConsent(user.id);

  if (!consentActive) {
    redirect('/consent');
  }

  // 3. Consent is valid, render children
  return <>{children}</>;
}
