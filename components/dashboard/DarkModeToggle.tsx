'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DarkModeToggleProps {
  className?: string
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'text-cocoa-600 hover:text-cocoa-700 hover:bg-cocoa-100',
          className
        )}
      >
        <div className="w-5 h-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'text-cocoa-600 dark:text-cream-100 hover:text-cocoa-700 hover:bg-cocoa-100 dark:hover:bg-cocoa-800',
        'transition-all duration-200',
        className
      )}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  )
}
