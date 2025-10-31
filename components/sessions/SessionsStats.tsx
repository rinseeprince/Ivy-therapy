'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Clock, Calendar, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SessionsStatsProps {
  totalSessions: number
  totalMinutes: number
  completedSessions: number
  averageDuration: number
}

export function SessionsStats({
  totalSessions,
  totalMinutes,
  completedSessions,
  averageDuration,
}: SessionsStatsProps) {
  const stats = [
    {
      label: 'Total Sessions',
      value: totalSessions,
      icon: MessageCircle,
      color: 'from-cocoa-600 to-cocoa-700',
    },
    {
      label: 'Total Time',
      value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      icon: Clock,
      color: 'from-teal-400 to-teal-500',
    },
    {
      label: 'Completed',
      value: completedSessions,
      icon: Calendar,
      color: 'from-cocoa-500 to-teal-400',
    },
    {
      label: 'Avg Duration',
      value: `${Math.round(averageDuration)} min`,
      icon: TrendingUp,
      color: 'from-teal-400 to-teal-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'relative overflow-hidden p-4 border-0 bg-gradient-to-br text-white',
                stat.color
              )}
            >
              {/* Background icon decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Icon className="w-32 h-32 text-white" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
