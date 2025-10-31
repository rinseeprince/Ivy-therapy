'use client'

import { motion } from 'framer-motion'
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MoodInsightsCardProps {
  averageMood: number
  moodTrend: 'improving' | 'stable' | 'declining'
  averageImprovement: number
  moodHistory: number[]
}

export function MoodInsightsCard({
  averageMood,
  moodTrend,
  averageImprovement,
  moodHistory,
}: MoodInsightsCardProps) {
  const getTrendConfig = () => {
    switch (moodTrend) {
      case 'improving':
        return {
          icon: TrendingUp,
          color: 'text-teal-500',
          bgColor: 'bg-teal-50',
          darkBgColor: 'dark:bg-teal-900/20',
          label: 'Improving',
          gradient: 'from-cream-100 to-teal-50',
        }
      case 'declining':
        return {
          icon: TrendingDown,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          darkBgColor: 'dark:bg-amber-900/20',
          label: 'Needs attention',
          gradient: 'from-cream-100 to-amber-50',
        }
      default:
        return {
          icon: Minus,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          darkBgColor: 'dark:bg-blue-900/20',
          label: 'Stable',
          gradient: 'from-cream-100 to-blue-50',
        }
    }
  }

  const trendConfig = getTrendConfig()
  const TrendIcon = trendConfig.icon

  // Simple sparkline visualization
  const maxMood = Math.max(...moodHistory, 10)
  const minMood = Math.min(...moodHistory, 0)
  const range = maxMood - minMood || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
        className={cn(
          'p-6 backdrop-blur-sm border-cocoa-200/50',
          'bg-gradient-to-r',
          trendConfig.gradient,
          'dark:from-cocoa-900/20 dark:to-teal-900/10'
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-cocoa-700" />
          <h3 className="text-lg font-semibold text-cocoa-700">Mood Insights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Average Mood */}
          <div className="space-y-2">
            <p className="text-sm text-cocoa-600 font-medium">Average Mood</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cocoa-700">
                {averageMood.toFixed(1)}
              </span>
              <span className="text-sm text-cocoa-500">/10</span>
            </div>
            <p className="text-xs text-cocoa-500">Overall wellness score</p>
          </div>

          {/* Mood Trend */}
          <div className="space-y-2">
            <p className="text-sm text-cocoa-600 font-medium">Trend</p>
            <div className={cn('flex items-center gap-2', trendConfig.color)}>
              <div className={cn('p-2 rounded-lg', trendConfig.bgColor, trendConfig.darkBgColor)}>
                <TrendIcon className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">{trendConfig.label}</span>
            </div>

            {/* Mini sparkline */}
            <div className="flex items-end gap-0.5 h-8">
              {moodHistory.slice(-10).map((mood, index) => {
                const height = ((mood - minMood) / range) * 100
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                    className={cn(
                      'flex-1 rounded-t',
                      moodTrend === 'improving' ? 'bg-teal-400' :
                      moodTrend === 'declining' ? 'bg-amber-400' :
                      'bg-blue-400'
                    )}
                    style={{ minHeight: '2px' }}
                  />
                )
              })}
            </div>
          </div>

          {/* Average Improvement */}
          <div className="space-y-2">
            <p className="text-sm text-cocoa-600 font-medium">Per Session</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-teal-500">
                +{averageImprovement.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-cocoa-500">
              Your mood typically improves by this amount per session
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
