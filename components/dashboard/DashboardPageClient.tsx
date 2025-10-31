'use client'

import { motion } from 'framer-motion'
import { Clock, MessageCircle, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { MoodInsightsCard } from '@/components/dashboard/MoodInsightsCard'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DidYouKnowCard } from '@/components/dashboard/DidYouKnowCard'
import { DarkModeToggle } from '@/components/dashboard/DarkModeToggle'
import Link from 'next/link'

interface DashboardSession {
  id: string
  date: Date
  duration: number
  topic?: string
  preview?: string
  moodBefore?: number
  moodAfter?: number
  messageCount?: number
  topics?: string[]
}

interface DashboardPageClientProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  stats: {
    totalSessions: number
    totalHours: number
    averageSessionLength: number
    daysSinceLastSession: number
  }
  moodData: {
    averageMood: number
    moodTrend: 'improving' | 'stable' | 'declining'
    averageImprovement: number
    moodHistory: number[]
  }
  recentSessions: DashboardSession[]
}

export function DashboardPageClient({
  user,
  stats,
  moodData,
  recentSessions,
}: DashboardPageClientProps) {
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
                  Welcome back, {user.name}!
                </h1>
                <p className="text-lg text-cocoa-600 dark:text-cream-200">
                  Ready to continue your wellness journey?
                </p>
              </div>
              <DarkModeToggle />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                asChild
                className="bg-cocoa-700 text-cream-100 hover:bg-cocoa-800 transition-all hover:scale-105"
              >
                <Link href="/session/new">Start New Session</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-cocoa-700 text-cocoa-700 hover:bg-cocoa-50 dark:border-cream-200 dark:text-cream-200 dark:hover:bg-cocoa-800"
              >
                <Link href="/progress">View Progress</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats cards row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon={MessageCircle}
              gradient="from-cocoa-600 to-cocoa-700"
              delay={0}
            />
            <StatsCard
              title="Hours of Therapy"
              value={stats.totalHours}
              icon={Clock}
              suffix=" hrs"
              gradient="from-teal-400 to-teal-500"
              delay={0.1}
            />
            <StatsCard
              title="Avg Session Length"
              value={stats.averageSessionLength}
              icon={TrendingUp}
              suffix=" min"
              gradient="from-cocoa-500 to-teal-400"
              delay={0.2}
            />
            <StatsCard
              title="Last Session"
              value={
                stats.daysSinceLastSession === 0
                  ? 'Today'
                  : stats.daysSinceLastSession === 1
                  ? 'Yesterday'
                  : `${stats.daysSinceLastSession} days ago`
              }
              icon={Calendar}
              gradient={
                stats.daysSinceLastSession <= 3
                  ? 'from-teal-400 to-teal-500'
                  : 'from-amber-400 to-amber-500'
              }
              delay={0.3}
            />
          </div>

          {/* Mood Insights Card */}
          <MoodInsightsCard {...moodData} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Sessions */}
          <RecentSessions sessions={recentSessions} />

          {/* Did You Know Card */}
          <DidYouKnowCard
            totalSessions={stats.totalSessions}
            totalHours={stats.totalHours}
            averageSessionLength={stats.averageSessionLength}
            daysSinceLastSession={stats.daysSinceLastSession}
          />
        </div>
      </main>
    </div>
  )
}
