"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Loader2, Brain } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireConsent?: boolean
}

export function AuthGuard({ children, requireConsent = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [consentStatus, setConsentStatus] = useState<boolean | null>(null)
  const [checkingConsent, setCheckingConsent] = useState(requireConsent)

  // Check auth
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Check consent status if required
  useEffect(() => {
    async function checkConsent() {
      if (!requireConsent || !user) {
        setCheckingConsent(false)
        return
      }

      try {
        // Fetch user settings to check consent and deletion status
        const response = await fetch('/api/user/settings')
        if (response.ok) {
          const data = await response.json()
          const hasConsent = data?.settings?.has_active_consent || false
          const isPendingDeletion = data?.settings?.pending_deletion || false

          // If account is pending deletion, immediately redirect to logout
          if (isPendingDeletion) {
            router.push('/')
            return
          }

          setConsentStatus(hasConsent)

          if (!hasConsent) {
            router.push('/consent')
          }
        } else {
          // If can't check, assume no consent
          setConsentStatus(false)
          router.push('/consent')
        }
      } catch (error) {
        console.error('Failed to check consent:', error)
        setConsentStatus(false)
        router.push('/consent')
      } finally {
        setCheckingConsent(false)
      }
    }

    if (!loading && user) {
      checkConsent()
    }
  }, [user, loading, router, requireConsent])

  if (loading || checkingConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requireConsent && !consentStatus) {
    return null // Will redirect to consent
  }

  return <>{children}</>
}