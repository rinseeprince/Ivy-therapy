"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Mic, MessageSquare, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: 'limit_reached' | 'post_session' | 'in_session'
  daysUntilReset?: number
}

export function UpgradeModal({
  open,
  onOpenChange,
  trigger = 'limit_reached',
  daysUntilReset = 0
}: UpgradeModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    // TODO: Navigate to pricing/upgrade page
    router.push('/pricing')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {trigger === 'post_session' && "Great session!"}
            {trigger === 'in_session' && "Experience voice therapy"}
            {trigger === 'limit_reached' && "You've reached your weekly limit"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {trigger === 'post_session' && (
              <span>
                Did you know premium members can have these sessions by voice? It feels just like talking to a real therapist.
              </span>
            )}
            {trigger === 'in_session' && (
              <span>
                Premium members can have sessions by voice for a more natural, conversational experience.
              </span>
            )}
            {trigger === 'limit_reached' && (
              <span>
                You've completed your 3 free text sessions for this week.
                {daysUntilReset > 0 && ` Resets in ${daysUntilReset} day${daysUntilReset > 1 ? 's' : ''}.`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Free vs Premium Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Free
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    3 text sessions per week
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="border-2 border-teal-500 rounded-lg p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/20 dark:to-teal-900/20 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                PREMIUM
              </div>
              <div className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-3">
                Premium
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    Unlimited text sessions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    Voice therapy sessions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    Priority support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Session Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Voice Sessions Feel Like Real Therapy
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Have natural, spoken conversations with your AI therapist. It's more immersive, personal, and feels just like talking to a real therapist.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {trigger === 'limit_reached' ? 'Maybe Later' : 'Not Now'}
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Unlock Voice Sessions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
