'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DarkModeToggle } from '@/components/dashboard/DarkModeToggle'
import { SessionCard } from './SessionCard'
import { SessionsStats } from './SessionsStats'
import { SessionsFilter } from './SessionsFilter'
import Link from 'next/link'

interface Session {
  id: string
  started_at: string
  duration_minutes?: number
  status: 'completed' | 'in_progress' | 'cancelled'
  transcript?: any[]
  session_summaries?: Array<{
    summary: string
    key_topics?: string[]
  }>
}

interface SessionsPageClientProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  sessions: Session[]
  stats: {
    totalSessions: number
    completedSessions: number
    totalMinutes: number
    averageDuration: number
  }
}

export function SessionsPageClient({
  user,
  sessions,
  stats,
}: SessionsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((session) => {
        const summary = session.session_summaries?.[0]?.summary || ''
        const topics = session.session_summaries?.[0]?.key_topics || []
        const searchLower = searchQuery.toLowerCase()

        return (
          summary.toLowerCase().includes(searchLower) ||
          topics.some((topic) => topic.toLowerCase().includes(searchLower))
        )
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((session) => session.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        case 'oldest':
          return new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
        case 'longest':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0)
        case 'shortest':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [sessions, searchQuery, statusFilter, sortBy])

  const isEmpty = sessions.length === 0
  const hasNoResults = filteredSessions.length === 0 && !isEmpty

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-cocoa-900">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-cocoa-700 dark:text-cream-100">
                  My Sessions
                </h1>
                <p className="text-lg text-cocoa-600 dark:text-cream-200">
                  Review your therapy sessions and track your progress
                </p>
              </div>
              <DarkModeToggle />
            </div>
          </motion.div>

          {!isEmpty && (
            <>
              {/* Stats */}
              <SessionsStats {...stats} />

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <SessionsFilter
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatusFilter}
                  onSortChange={setSortBy}
                />
              </motion.div>
            </>
          )}

          {/* Sessions List */}
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-12 text-center bg-gradient-to-br from-cream-100 to-teal-50 dark:from-cocoa-800 dark:to-cocoa-700 border-teal-200/50">
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                    <Brain className="w-12 h-12 text-teal-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                  No sessions yet
                </h3>
                <p className="text-cocoa-600 dark:text-cream-200 mb-6 max-w-md mx-auto">
                  Start your first therapy session to begin your wellness journey
                </p>
                <Button
                  asChild
                  className="bg-cocoa-700 text-cream-100 hover:bg-cocoa-800"
                >
                  <Link href="/session/new">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Your First Session
                  </Link>
                </Button>
              </Card>
            </motion.div>
          ) : hasNoResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 text-center bg-white dark:bg-cocoa-800">
                <p className="text-cocoa-600 dark:text-cream-200">
                  No sessions match your filters. Try adjusting your search or filters.
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session, index) => (
                <SessionCard key={session.id} session={session} index={index} />
              ))}
            </div>
          )}

          {/* Results count */}
          {!isEmpty && !hasNoResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-sm text-cocoa-500 dark:text-cream-300"
            >
              Showing {filteredSessions.length} of {sessions.length} session
              {sessions.length !== 1 ? 's' : ''}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
