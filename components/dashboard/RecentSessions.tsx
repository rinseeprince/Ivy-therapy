'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, Clock, MessageCircle, ArrowRight, Brain } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Session {
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

interface RecentSessionsProps {
  sessions: Session[]
  onViewAll?: () => void
}

const MOOD_EMOJIS = ['😢', '😟', '😐', '🙂', '😊']

function getMoodEmoji(mood: number): string {
  if (mood <= 2) return MOOD_EMOJIS[0]
  if (mood <= 4) return MOOD_EMOJIS[1]
  if (mood <= 6) return MOOD_EMOJIS[2]
  if (mood <= 8) return MOOD_EMOJIS[3]
  return MOOD_EMOJIS[4]
}

export function RecentSessions({ sessions, onViewAll }: RecentSessionsProps) {
  const isEmpty = sessions.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cocoa-700">Recent Sessions</h2>
        {!isEmpty && (
          <Button
            variant="ghost"
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            onClick={onViewAll}
            asChild
          >
            <Link href="/sessions">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-cream-100 to-teal-50 border-teal-200/50">
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-teal-100 rounded-full">
                <Brain className="w-12 h-12 text-teal-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-cocoa-700 mb-2">
              No sessions yet
            </h3>
            <p className="text-cocoa-600 mb-6 max-w-md mx-auto">
              Start your first therapy session to begin your wellness journey
            </p>
            <Button
              asChild
              className="bg-cocoa-700 text-cream-100 hover:bg-cocoa-800"
            >
              <Link href="/session/new">
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Session
              </Link>
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {sessions.slice(0, 5).map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'p-6 hover:shadow-lg transition-all duration-300',
                  'hover:-translate-y-1 cursor-pointer',
                  'bg-white dark:bg-cocoa-800 border-cocoa-200/50'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Date and duration */}
                    <div className="flex items-center gap-4 text-sm text-cocoa-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(session.date, 'EEEE, MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} minutes</span>
                      </div>
                      {session.messageCount && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{session.messageCount} messages</span>
                        </div>
                      )}
                    </div>

                    {/* Preview */}
                    {session.preview && (
                      <p className="text-cocoa-700 line-clamp-2">
                        {session.preview}
                      </p>
                    )}

                    {/* Topics */}
                    {session.topics && session.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {session.topics.map((topic, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-teal-100 text-teal-700 hover:bg-teal-200"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Mood indicator */}
                    {session.moodBefore !== undefined &&
                      session.moodAfter !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-cocoa-600">Mood:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg">
                              {getMoodEmoji(session.moodBefore)}
                            </span>
                            <span className="text-cocoa-500">
                              {session.moodBefore}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-cocoa-400" />
                          <div className="flex items-center gap-1">
                            <span className="text-lg">
                              {getMoodEmoji(session.moodAfter)}
                            </span>
                            <span className="text-teal-600 font-semibold">
                              {session.moodAfter}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Status badge and action */}
                  <div className="flex flex-col items-end gap-3">
                    <Badge className="bg-teal-500 text-white hover:bg-teal-600">
                      Completed
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cocoa-600 hover:text-cocoa-700 hover:bg-cocoa-50"
                      asChild
                    >
                      <Link href={`/sessions/${session.id}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

import { PlayCircle } from 'lucide-react'
