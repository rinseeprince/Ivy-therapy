"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, name)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-50 via-cream-50 to-lavender-100 p-4">
        <Card className="w-full max-w-md border-maroon-900/10 shadow-soft bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-sand-100">
                <Brain className="h-10 w-10 text-cocoa-900" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-maroon-900">Check your email</CardTitle>
            <p className="text-maroon-900/60">
              We've sent you a confirmation link. Please check your email and click the link to activate your account.
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full h-12 font-medium rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#2a1a17', color: 'white' }}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-3xl font-bold text-maroon-900">Create your account</CardTitle>
          <p className="text-maroon-900/60">Start your journey with MindfulAI</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-sand-50 border-maroon-900/10 focus:border-cocoa-900 focus:ring-cocoa-900 text-maroon-900 placeholder:text-maroon-900/40"
              />
            </div>
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
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-maroon-900/60">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-cocoa-900 hover:text-cocoa-900/80 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}