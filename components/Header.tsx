'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-cocoa-900/5 backdrop-blur-md bg-sand-50/80 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="text-lg font-semibold text-cocoa-900 hover:opacity-80 transition-opacity"
          >
            MindfulAI
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#products" 
              className="text-sm font-medium text-cocoa-900/70 hover:text-cocoa-900 transition-colors"
            >
              Products
            </Link>
            <Link 
              href="#about" 
              className="text-sm font-medium text-cocoa-900/70 hover:text-cocoa-900 transition-colors"
            >
              About
            </Link>
            <Link 
              href="#learn" 
              className="text-sm font-medium text-cocoa-900/70 hover:text-cocoa-900 transition-colors"
            >
              Learn
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="rounded-full text-cocoa-900 hover:bg-sand-100 px-6 h-10 text-sm font-medium"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-cocoa-900 text-sand-50 hover:bg-cocoa-900/90 px-6 h-10 text-sm font-medium transition-all hover:scale-105"
            >
              <Link href="/session/new">Get the app</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

