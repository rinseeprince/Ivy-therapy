"use client"

import { useState } from "react"
import { AlertCircle, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpgradeModal } from "./UpgradeModal"
import { cn } from "@/lib/utils"

interface SessionLimitBannerProps {
  sessionsUsed: number
  sessionsLimit: number
  daysUntilReset: number
  variant?: 'warning' | 'limit'
}

export function SessionLimitBanner({
  sessionsUsed,
  sessionsLimit,
  daysUntilReset,
  variant = 'warning'
}: SessionLimitBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (isDismissed) return null

  const isLastSession = sessionsUsed === sessionsLimit - 1 && variant === 'warning'
  const isLimitReached = sessionsUsed >= sessionsLimit && variant === 'limit'

  if (!isLastSession && !isLimitReached) return null

  return (
    <>
      <div
        className={cn(
          "mx-auto max-w-3xl rounded-lg p-4 mb-6 border",
          isLimitReached
            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
            : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
        )}
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              isLimitReached
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
            )}
          />
          <div className="flex-1">
            <p
              className={cn(
                "font-medium mb-1",
                isLimitReached
                  ? "text-red-900 dark:text-red-100"
                  : "text-amber-900 dark:text-amber-100"
              )}
            >
              {isLimitReached
                ? "Session limit reached"
                : "You have 1 text session remaining this week"}
            </p>
            <p
              className={cn(
                "text-sm",
                isLimitReached
                  ? "text-red-700 dark:text-red-300"
                  : "text-amber-700 dark:text-amber-300"
              )}
            >
              {isLimitReached ? (
                <>
                  Your free sessions reset in {daysUntilReset} day{daysUntilReset > 1 ? 's' : ''}.
                  Upgrade to premium for unlimited text sessions + voice therapy.
                </>
              ) : (
                <>
                  Upgrade to premium for unlimited text sessions + voice therapy sessions.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        trigger={isLimitReached ? 'limit_reached' : 'in_session'}
        daysUntilReset={daysUntilReset}
      />
    </>
  )
}
