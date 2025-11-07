"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckInReminderBanner() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check if user has dismissed the banner today
    const dismissedToday = localStorage.getItem("checkInBannerDismissed");
    const today = new Date().toDateString();

    if (dismissedToday === today) {
      return;
    }

    try {
      const response = await fetch("/api/journal/check-in-status");
      const data = await response.json();
      if (data.success && !data.hasCheckedInToday) {
        setShowBanner(true);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    // Store dismissal in localStorage
    localStorage.setItem("checkInBannerDismissed", new Date().toDateString());
  };

  const handleCheckIn = () => {
    router.push("/check-in");
  };

  return (
    <AnimatePresence>
      {showBanner && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Haven't checked in today?</p>
                  <p className="text-sm text-teal-50">
                    Take 30 seconds to track your mood and reflect on your day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCheckIn}
                  size="sm"
                  className="bg-white text-teal-600 hover:bg-teal-50"
                >
                  Check In Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
