'use client'

import Link from 'next/link'
import { Brain, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SessionDetailHeader() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-cocoa-900" />
          <span className="font-semibold">MindfulAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sessions">
            <Button variant="outline">All Sessions</Button>
          </Link>
          <Link href="/session/new">
            <Button style={{ backgroundColor: '#2a1a17', color: 'white' }}>New Session</Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-cocoa-900"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </div>
    </header>
  )
}
