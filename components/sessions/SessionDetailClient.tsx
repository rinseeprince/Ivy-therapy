'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Calendar,
  Clock,
  TrendingUp,
  MessageCircle,
  Lightbulb,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DarkModeToggle } from '@/components/dashboard/DarkModeToggle'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SessionDetailClientProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  session: {
    id: string
    started_at: string
    duration_minutes?: number
    status: string
    session_summaries?: Array<{
      summary: string
      mood_assessment?: string
      key_topics?: string[]
      next_steps?: string[]
      therapist_notes?: string
    }>
  }
}

export function SessionDetailClient({ user, session }: SessionDetailClientProps) {
  const summary = session.session_summaries?.[0]
  const hasSummary = !!summary

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-cocoa-900">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Link href="/sessions">
                  <Button
                    variant="ghost"
                    className="text-cocoa-600 hover:text-cocoa-700 hover:bg-cocoa-50 dark:text-cream-200 dark:hover:bg-cocoa-800 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sessions
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold text-cocoa-700 dark:text-cream-100">
                  Session Summary
                </h1>
                <div className="flex items-center gap-4 text-sm text-cocoa-600 dark:text-cream-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(session.started_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {session.duration_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                  )}
                  <Badge className="bg-teal-500 text-white hover:bg-teal-600">
                    {session.status === 'completed' ? 'Completed' : session.status}
                  </Badge>
                </div>
              </div>
              <DarkModeToggle />
            </div>
          </motion.div>

          {hasSummary ? (
            <>
              {/* Session Overview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-white to-cream-50 dark:from-cocoa-800 dark:to-cocoa-700 border-cocoa-200/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100">
                      Session Overview
                    </h2>
                  </div>
                  <p className="text-cocoa-700 dark:text-cream-100 leading-relaxed text-lg">
                    {summary!.summary}
                  </p>
                </Card>
              </motion.div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Mood Assessment */}
                {summary!.mood_assessment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="p-6 h-full bg-white dark:bg-cocoa-800 border-cocoa-200/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                          <Heart className="w-5 h-5 text-teal-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-cocoa-700 dark:text-cream-100">
                          Mood Assessment
                        </h2>
                      </div>
                      <p className="text-cocoa-600 dark:text-cream-200 leading-relaxed">
                        {summary!.mood_assessment}
                      </p>
                    </Card>
                  </motion.div>
                )}

                {/* Key Topics */}
                {summary!.key_topics && summary!.key_topics.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card className="p-6 h-full bg-white dark:bg-cocoa-800 border-cocoa-200/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cocoa-100 dark:bg-cocoa-700 rounded-lg">
                          <Brain className="w-5 h-5 text-cocoa-600 dark:text-cream-200" />
                        </div>
                        <h2 className="text-xl font-semibold text-cocoa-700 dark:text-cream-100">
                          Key Topics
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {summary!.key_topics.map((topic: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-1">
                              <div className="w-2 h-2 rounded-full bg-teal-500" />
                            </div>
                            <span className="text-cocoa-600 dark:text-cream-200 leading-relaxed flex-1">
                              {topic}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Next Steps */}
              {summary!.next_steps && summary!.next_steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-teal-50 to-cream-100 dark:from-cocoa-800 dark:to-cocoa-700 border-teal-200/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-teal-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-cocoa-700 dark:text-cream-100">
                        Next Steps
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {summary!.next_steps.map((step: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-4 group"
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-full',
                              'bg-teal-500 text-white font-semibold text-sm',
                              'group-hover:scale-110 transition-transform'
                            )}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-cocoa-700 dark:text-cream-100 leading-relaxed">
                              {step}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Therapist Notes */}
              {summary!.therapist_notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="p-6 bg-white dark:bg-cocoa-800 border-cocoa-200/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-cocoa-100 dark:bg-cocoa-700 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-cocoa-600 dark:text-cream-200" />
                      </div>
                      <h2 className="text-xl font-semibold text-cocoa-700 dark:text-cream-100">
                        Therapist Notes
                      </h2>
                    </div>
                    <p className="text-cocoa-600 dark:text-cream-200 leading-relaxed">
                      {summary!.therapist_notes}
                    </p>
                  </Card>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center bg-gradient-to-br from-cream-100 to-teal-50 dark:from-cocoa-800 dark:to-cocoa-700 border-teal-200/50">
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                    <Brain className="w-12 h-12 text-teal-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-cocoa-700 dark:text-cream-100 mb-2">
                  Summary is being generated
                </h3>
                <p className="text-cocoa-600 dark:text-cream-200">
                  Please refresh in a moment to see your session insights.
                </p>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <Button
              asChild
              variant="outline"
              className="border-cocoa-700 text-cocoa-700 hover:bg-cocoa-50 dark:border-cream-200 dark:text-cream-200 dark:hover:bg-cocoa-800"
            >
              <Link href="/sessions">View All Sessions</Link>
            </Button>
            <Button
              asChild
              className="bg-cocoa-700 text-cream-100 hover:bg-cocoa-800 transition-all hover:scale-105"
            >
              <Link href="/session/new">Start New Session</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
