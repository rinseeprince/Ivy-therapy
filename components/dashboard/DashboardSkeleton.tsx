'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function StatCardSkeleton() {
  return (
    <Card className="p-6 border-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}

export function MoodInsightsSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SessionCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </Card>
  )
}

export function QuickActionSkeleton() {
  return (
    <Card className="p-6 h-full">
      <div className="flex flex-col h-full space-y-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full flex-1" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Mood insights skeleton */}
      <MoodInsightsSkeleton />

      {/* Quick actions skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Recent sessions skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
