'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MessageCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SessionCardProps {
  session: {
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
  index: number
}

export function SessionCard({ session, index }: SessionCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-teal-500 text-white hover:bg-teal-600',
        }
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-blue-500 text-white hover:bg-blue-600',
        }
      default:
        return {
          label: 'Cancelled',
          className: 'bg-gray-400 text-white hover:bg-gray-500',
        }
    }
  }

  const statusConfig = getStatusConfig(session.status)
  const summary = session.session_summaries?.[0]
  const topics = summary?.key_topics || []
  const messageCount = session.transcript?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'p-6 transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-1',
          'bg-white dark:bg-cocoa-800 border-cocoa-200/50',
          'cursor-pointer group'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Main content */}
          <div className="flex-1 space-y-3">
            {/* Date, duration, and status */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-cocoa-600 dark:text-cream-200">
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
                <div className="flex items-center gap-2 text-sm text-cocoa-600 dark:text-cream-200">
                  <Clock className="w-4 h-4" />
                  <span>{session.duration_minutes} minutes</span>
                </div>
              )}

              {messageCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-cocoa-600 dark:text-cream-200">
                  <MessageCircle className="w-4 h-4" />
                  <span>{messageCount} messages</span>
                </div>
              )}
            </div>

            {/* Summary preview */}
            {summary ? (
              <p className="text-cocoa-700 dark:text-cream-100 line-clamp-2 leading-relaxed">
                {summary.summary.slice(0, 200)}
                {summary.summary.length > 200 && '...'}
              </p>
            ) : session.status === 'completed' ? (
              <p className="text-cocoa-500 dark:text-cream-300 italic">
                Summary is being generated...
              </p>
            ) : (
              <p className="text-cocoa-500 dark:text-cream-300">
                Session transcript available
              </p>
            )}

            {/* Key topics */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.slice(0, 3).map((topic: string, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    {topic}
                  </Badge>
                ))}
                {topics.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-cocoa-100 text-cocoa-600 dark:bg-cocoa-700 dark:text-cream-200"
                  >
                    +{topics.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right side - Status and action */}
          <div className="flex flex-col items-end gap-3">
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              className="text-cocoa-600 hover:text-cocoa-700 hover:bg-cocoa-50 dark:text-cream-200 dark:hover:bg-cocoa-700 group-hover:bg-teal-50 group-hover:text-teal-700 transition-all"
              asChild
            >
              <Link href={`/sessions/${session.id}`}>
                View Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
