'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Calendar,
  PlayCircle,
  BookOpen,
  TrendingUp,
  Library,
  Heart,
  Target,
  Lightbulb,
  Settings,
  User,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  name: string
  href: string
  icon: any
  section: 'core' | 'wellness' | 'organization'
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, section: 'core' },
  { name: 'My Sessions', href: '/sessions', icon: Calendar, section: 'core' },
  { name: 'Start Session', href: '/session/new', icon: PlayCircle, section: 'core' },
  { name: 'Journal Entries', href: '/journal', icon: BookOpen, section: 'core' },
  { name: 'Progress Tracking', href: '/progress', icon: TrendingUp, section: 'core' },
  { name: 'Resources', href: '/resources', icon: Library, section: 'core' },
  { name: 'Mood Tracker', href: '/mood-tracker', icon: Heart, section: 'wellness' },
  { name: 'Goals & Habits', href: '/goals', icon: Target, section: 'wellness' },
  { name: 'Insights', href: '/insights', icon: Lightbulb, section: 'wellness' },
  { name: 'Settings', href: '/settings', icon: Settings, section: 'organization' },
  { name: 'Account', href: '/account', icon: User, section: 'organization' },
  { name: 'Help & Support', href: '/support', icon: HelpCircle, section: 'organization' },
]

interface DashboardSidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'core':
        return 'CORE'
      case 'wellness':
        return 'WELLNESS'
      case 'organization':
        return 'ORGANIZATION'
      default:
        return ''
    }
  }

  const renderNavItems = (section: 'core' | 'wellness' | 'organization') => {
    return navigation
      .filter((item) => item.section === section)
      .map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        const isStartSession = item.href === '/session/new'

        return (
          <Link key={item.name} href={item.href}>
            <motion.div
              whileHover={{ x: collapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'group relative',
                isActive
                  ? 'bg-teal-400/20 text-teal-400'
                  : 'text-cream-100/70 hover:bg-cocoa-600/50 hover:text-cream-100',
                isStartSession && !isActive && 'text-teal-300 hover:text-teal-200',
                collapsed && 'justify-center'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  isActive && 'scale-110',
                  isStartSession && 'animate-pulse-slow'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-cocoa-800 text-cream-100 text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </motion.div>
          </Link>
        )
      })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-cocoa-700 border-r border-cocoa-600 flex flex-col sticky top-0"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-cocoa-600">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-cream-100">MindfulAI</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-cream-100/70 hover:text-cream-100 hover:bg-cocoa-600/50"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Core Section */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-cream-100/50 tracking-wider">
              {getSectionTitle('core')}
            </h3>
          )}
          <div className="space-y-1">{renderNavItems('core')}</div>
        </div>

        {/* Wellness Section */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-cream-100/50 tracking-wider">
              {getSectionTitle('wellness')}
            </h3>
          )}
          <div className="space-y-1">{renderNavItems('wellness')}</div>
        </div>

        {/* Organization Section */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-cream-100/50 tracking-wider">
              {getSectionTitle('organization')}
            </h3>
          )}
          <div className="space-y-1">{renderNavItems('organization')}</div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-cocoa-600">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-cocoa-600/50 transition-colors cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <Avatar className="w-8 h-8 border-2 border-teal-400/30">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-teal-400 text-cocoa-700 text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-cream-100/50 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
