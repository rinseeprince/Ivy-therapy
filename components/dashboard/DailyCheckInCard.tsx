"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, CheckCircle, Flame, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CheckInStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  todaysMood?: number | null;
}

const moodEmojis = ["😢", "😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤗", "🥳"];

export function DailyCheckInCard() {
  const router = useRouter();
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/journal/check-in-status");
      const data = await response.json();
      if (data.success) {
        setStatus({
          hasCheckedInToday: data.hasCheckedInToday,
          currentStreak: data.currentStreak,
          todaysMood: data.todaysMood,
        });
      }
    } catch (error) {
      console.error("Error fetching check-in status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 dark:bg-teal-700/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-200/20 dark:bg-teal-700/10 rounded-full -ml-12 -mb-12" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                status.hasCheckedInToday
                  ? "bg-teal-600"
                  : "bg-teal-500 animate-pulse"
              }`}
            >
              {status.hasCheckedInToday ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <Heart className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cocoa-800 dark:text-cream-100">
                Daily Check-In
              </h3>
              {status.currentStreak > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    {status.currentStreak} day streak
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {status.hasCheckedInToday ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/50 dark:bg-cocoa-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
                    Today's Mood
                  </p>
                  <div className="flex items-center gap-2">
                    {status.todaysMood && (
                      <>
                        <span className="text-3xl">
                          {moodEmojis[status.todaysMood - 1]}
                        </span>
                        <span className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                          {status.todaysMood}/10
                        </span>
                      </>
                    )}
                    {!status.todaysMood && (
                      <span className="text-sm text-cocoa-500 dark:text-cream-300">
                        No mood recorded
                      </span>
                    )}
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-3">
              ✓ You've checked in today! Keep up the great work.
            </p>
            <Button
              onClick={() => router.push("/journal")}
              variant="outline"
              className="w-full border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              View Journal
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-cocoa-600 dark:text-cream-200 mb-4">
              Take 30 seconds to check in with yourself. How are you feeling today?
            </p>
            <Button
              onClick={() => router.push("/check-in")}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              Check In Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
