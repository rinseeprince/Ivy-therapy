"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-50 via-cream-50 to-lavender-100 p-4">
      <Card className="w-full max-w-md border-maroon-900/10 shadow-soft bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-sand-100">
              <Brain className="h-10 w-10 text-cocoa-900" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-maroon-900">Welcome back</CardTitle>
          <p className="text-maroon-900/60">Sign in to your MindfulAI account</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-sand-50 border-maroon-900/10 focus:border-cocoa-900 focus:ring-cocoa-900 text-maroon-900 placeholder:text-maroon-900/40"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-sand-50 border-maroon-900/10 focus:border-cocoa-900 focus:ring-cocoa-900 text-maroon-900 placeholder:text-maroon-900/40"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 font-medium rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#2a1a17', color: 'white' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-maroon-900/60">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-cocoa-900 hover:text-cocoa-900/80 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}