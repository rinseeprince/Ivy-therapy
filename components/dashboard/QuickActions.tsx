'use client'

import { motion } from 'framer-motion'
import { PlayCircle, Calendar, Download, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ActionCard {
  title: string
  description: string
  icon: any
  href: string
  variant: 'primary' | 'secondary'
  gradient?: string
}

const actions: ActionCard[] = [
  {
    title: 'Start New Session',
    description: 'Ready to talk? Start a new therapy session',
    icon: PlayCircle,
    href: '/session/new',
    variant: 'primary',
    gradient: 'from-cocoa-600 to-cocoa-700',
  },
  {
    title: 'View All Sessions',
    description: 'Review your therapy history',
    icon: Calendar,
    href: '/sessions',
    variant: 'secondary',
  },
  {
    title: 'Manage Data',
    description: 'Export or delete your data',
    icon: Download,
    href: '/settings/manage-data',
    variant: 'secondary',
  },
]

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cocoa-700">Quick Actions</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          const isPrimary = action.variant === 'primary'

          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card
                  className={cn(
                    'p-6 h-full transition-all duration-300 cursor-pointer',
                    'hover:-translate-y-1 hover:shadow-lg',
                    isPrimary
                      ? cn(
                          'bg-gradient-to-br border-0 text-white',
                          action.gradient,
                          'hover:shadow-glow-md'
                        )
                      : 'bg-white dark:bg-cocoa-800 border-cocoa-200/50 hover:border-teal-300'
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={cn(
                        'p-3 rounded-lg w-fit mb-4',
                        isPrimary
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-teal-100 dark:bg-teal-900/30'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6',
                          isPrimary ? 'text-white' : 'text-teal-600'
                        )}
                      />
                    </div>

                    <h3
                      className={cn(
                        'text-lg font-semibold mb-2',
                        isPrimary ? 'text-white' : 'text-cocoa-700'
                      )}
                    >
                      {action.title}
                    </h3>

                    <p
                      className={cn(
                        'text-sm flex-1',
                        isPrimary ? 'text-white/80' : 'text-cocoa-600'
                      )}
                    >
                      {action.description}
                    </p>

                    <div className="mt-4">
                      <Button
                        variant={isPrimary ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn(
                          'w-full',
                          isPrimary
                            ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                            : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                        )}
                      >
                        {isPrimary ? 'Start Now' : 'View'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
