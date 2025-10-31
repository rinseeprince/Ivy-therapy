'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: string
  delay?: number
  suffix?: string
  prefix?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  gradient = 'from-cocoa-600 to-cocoa-700',
  delay = 0,
  suffix = '',
  prefix = '',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const isNumeric = !isNaN(numericValue)

  useEffect(() => {
    if (!isNumeric) return

    const duration = 1500 // 1.5 seconds
    const steps = 60
    const stepValue = numericValue / steps
    const stepDelay = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDelay)

    return () => clearInterval(timer)
  }, [numericValue, isNumeric])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={cn(
          'relative overflow-hidden p-6 border-0 shadow-lg transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-xl',
          'bg-gradient-to-br',
          gradient
        )}
      >
        {/* Background icon decoration */}
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Icon className="w-32 h-32 text-white" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  'bg-white/20 backdrop-blur-sm text-white'
                )}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white">
              {prefix}
              {isNumeric ? displayValue : value}
              {suffix}
            </p>
          </div>
        </div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  )
}
