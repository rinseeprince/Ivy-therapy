'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Sparkles, Brain, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Insight {
  type: 'achievement' | 'stat' | 'tip' | 'encouragement'
  message: string
  icon: any
}

interface DidYouKnowCardProps {
  totalSessions?: number
  totalHours?: number
  averageSessionLength?: number
  daysSinceLastSession?: number
}

export function DidYouKnowCard({
  totalSessions = 0,
  totalHours = 0,
  averageSessionLength = 0,
  daysSinceLastSession = 0,
}: DidYouKnowCardProps) {
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null)

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Achievement insights
    if (totalSessions > 0) {
      insights.push({
        type: 'achievement',
        message: `You've completed ${totalSessions} session${totalSessions > 1 ? 's' : ''} - that's ${totalSessions} step${totalSessions > 1 ? 's' : ''} toward wellness!`,
        icon: Sparkles,
      })
    }

    if (totalHours > 0) {
      insights.push({
        type: 'achievement',
        message: `You've spent ${totalHours.toFixed(1)} hours investing in your mental health!`,
        icon: Heart,
      })
    }

    // Statistical insights
    if (totalSessions >= 5) {
      insights.push({
        type: 'stat',
        message: `Most people see meaningful progress after 5-7 sessions. You're on session ${totalSessions}!`,
        icon: Brain,
      })
    }

    if (averageSessionLength > 30) {
      insights.push({
        type: 'stat',
        message: `Your average session length (${Math.round(averageSessionLength)} min) is perfect for deep therapeutic work`,
        icon: Lightbulb,
      })
    }

    // Wellness tips
    insights.push(
      {
        type: 'tip',
        message: 'Therapy works best when combined with good sleep and regular exercise',
        icon: Lightbulb,
      },
      {
        type: 'tip',
        message: 'Journaling between sessions can help you process emotions more effectively',
        icon: Lightbulb,
      },
      {
        type: 'tip',
        message: 'Small, consistent steps lead to lasting change in mental wellness',
        icon: Brain,
      }
    )

    // Usage encouragement
    if (daysSinceLastSession >= 7) {
      insights.push({
        type: 'encouragement',
        message: `It's been ${daysSinceLastSession} days since your last session. Ready to check in?`,
        icon: Heart,
      })
    } else if (daysSinceLastSession <= 3 && totalSessions > 1) {
      insights.push({
        type: 'encouragement',
        message: 'Great consistency! Regular sessions show the best outcomes.',
        icon: Sparkles,
      })
    }

    insights.push({
      type: 'encouragement',
      message: 'Consistent sessions every 3-7 days show the best outcomes',
      icon: Brain,
    })

    return insights
  }

  useEffect(() => {
    const insights = generateInsights()
    // Pick a random insight
    const randomInsight = insights[Math.floor(Math.random() * insights.length)]
    setCurrentInsight(randomInsight)
  }, [totalSessions, totalHours, averageSessionLength, daysSinceLastSession])

  if (!currentInsight) return null

  const Icon = currentInsight.icon

  const getGradient = () => {
    switch (currentInsight.type) {
      case 'achievement':
        return 'from-teal-50 to-cream-100'
      case 'stat':
        return 'from-cream-100 to-teal-50'
      case 'tip':
        return 'from-cream-100 to-cream-200'
      case 'encouragement':
        return 'from-teal-50 to-lavender-100'
      default:
        return 'from-cream-100 to-cream-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card
        className={cn(
          'p-6 bg-gradient-to-r border-teal-200/50',
          getGradient(),
          'dark:from-cocoa-900/20 dark:to-teal-900/10'
        )}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex-shrink-0">
            <Icon className="w-6 h-6 text-teal-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-1 uppercase tracking-wide">
              Did You Know?
            </h3>
            <p className="text-cocoa-700 dark:text-cream-100 text-base leading-relaxed">
              {currentInsight.message}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
