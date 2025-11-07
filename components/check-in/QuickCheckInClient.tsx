"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Flame,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";

interface QuickCheckInClientProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  currentStreak: number;
  hasCheckedInToday: boolean;
}

const moodOptions = [
  { value: 1, emoji: "😢", label: "Terrible", color: "bg-red-500", hoverColor: "hover:bg-red-600" },
  { value: 2, emoji: "😞", label: "Bad", color: "bg-orange-500", hoverColor: "hover:bg-orange-600" },
  { value: 3, emoji: "😕", label: "Poor", color: "bg-orange-400", hoverColor: "hover:bg-orange-500" },
  { value: 4, emoji: "😐", label: "Okay", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600" },
  { value: 5, emoji: "🙂", label: "Fine", color: "bg-yellow-400", hoverColor: "hover:bg-yellow-500" },
  { value: 6, emoji: "😊", label: "Good", color: "bg-lime-500", hoverColor: "hover:bg-lime-600" },
  { value: 7, emoji: "😄", label: "Great", color: "bg-green-500", hoverColor: "hover:bg-green-600" },
  { value: 8, emoji: "😁", label: "Very Good", color: "bg-teal-500", hoverColor: "hover:bg-teal-600" },
  { value: 9, emoji: "🤗", label: "Excellent", color: "bg-teal-600", hoverColor: "hover:bg-teal-700" },
  { value: 10, emoji: "🥳", label: "Amazing", color: "bg-teal-700", hoverColor: "hover:bg-teal-800" },
];

const quickPrompts = [
  "How are you feeling right now?",
  "What's one thing you're grateful for today?",
  "What's on your mind?",
  "How did you sleep last night?",
  "What's your energy level like today?",
];

export default function QuickCheckInClient({
  user,
  currentStreak,
  hasCheckedInToday: initialHasCheckedIn,
}: QuickCheckInClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(initialHasCheckedIn ? 3 : 1); // 1: mood, 2: prompt, 3: complete
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(quickPrompts[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [newStreak, setNewStreak] = useState(currentStreak);

  useEffect(() => {
    // Randomly select a prompt on mount
    const randomPrompt = quickPrompts[Math.floor(Math.random() * quickPrompts.length)];
    setSelectedPrompt(randomPrompt);
  }, []);

  const handleMoodSelect = (mood: number) => {
    setMoodScore(mood);
    setStep(2);
  };

  const handleSkipPrompt = async () => {
    await saveCheckIn();
  };

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast({
        title: "Please write something",
        description: "Share at least a few words about how you're feeling",
        variant: "destructive",
      });
      return;
    }
    await saveCheckIn();
  };

  const saveCheckIn = async () => {
    setIsSaving(true);
    try {
      const response_api = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Daily Check-In - ${new Date().toLocaleDateString()}`,
          content: response.trim() || `Mood: ${moodScore}/10`,
          moodScore: moodScore,
          tags: ["daily-check-in"],
        }),
      });

      const data = await response_api.json();

      if (data.success) {
        // Fetch updated streak
        const streakResponse = await fetch("/api/journal/streak");
        const streakData = await streakResponse.json();
        if (streakData.success) {
          setNewStreak(streakData.currentStreak);
        }

        setStep(3);
        toast({
          title: "Check-in complete! 🎉",
          description: "Your daily check-in has been saved",
        });
      } else {
        throw new Error(data.error || "Failed to save check-in");
      }
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast({
        title: "Error",
        description: "Failed to save check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-cocoa-900 relative">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        {/* Dark mode toggle */}
        <div className="absolute top-4 right-4 z-10">
          <DarkModeToggle />
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              {step === 1 && (
                <Card className="p-8 bg-gradient-to-br from-white to-cream-50 dark:from-cocoa-800 dark:to-cocoa-900">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                      <Heart className="h-8 w-8 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
                      Daily Check-In
                    </h1>
                    <p className="text-cocoa-600 dark:text-cream-200">
                      How are you feeling today?
                    </p>
                    {currentStreak > 0 && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Flame className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold text-orange-700 dark:text-orange-400">
                          {currentStreak} day streak!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {moodOptions.map((mood) => (
                      <motion.button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood.value)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                          mood.color
                        } ${mood.hoverColor} text-white shadow-lg hover:shadow-xl`}
                      >
                        <span className="text-4xl">{mood.emoji}</span>
                        <span className="text-xs font-medium">{mood.value}</span>
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-center text-sm text-cocoa-500 dark:text-cream-300">
                    Select a number from 1 (terrible) to 10 (amazing)
                  </p>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-8 bg-gradient-to-br from-white to-cream-50 dark:from-cocoa-800 dark:to-cocoa-900">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                      <Sparkles className="h-8 w-8 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
                      {selectedPrompt}
                    </h2>
                    <p className="text-sm text-cocoa-600 dark:text-cream-200">
                      Take a moment to reflect (optional)
                    </p>
                  </div>

                  {moodScore && (
                    <div className="mb-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                        <span className="text-2xl">
                          {moodOptions.find((m) => m.value === moodScore)?.emoji}
                        </span>
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          Feeling: {moodOptions.find((m) => m.value === moodScore)?.label}
                        </span>
                      </div>
                    </div>
                  )}

                  <Textarea
                    placeholder="Write a few words about how you're feeling..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[150px] mb-6 text-lg"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Check-In
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSkipPrompt}
                      disabled={isSaving}
                      variant="outline"
                      size="lg"
                    >
                      Skip
                    </Button>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-8 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-600 mb-6"
                    >
                      <CheckCircle className="h-12 w-12 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
                      You're all set! 🎉
                    </h2>
                    <p className="text-lg text-cocoa-600 dark:text-cream-200 mb-6">
                      Thanks for checking in today
                    </p>

                    {newStreak > currentStreak && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-100 dark:bg-orange-900/30 rounded-full"
                      >
                        <Flame className="h-6 w-6 text-orange-600" />
                        <span className="font-bold text-xl text-orange-700 dark:text-orange-400">
                          {newStreak} day streak! 🔥
                        </span>
                      </motion.div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => router.push("/dashboard")}
                        size="lg"
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Back to Dashboard
                      </Button>
                      <Button
                        onClick={() => router.push("/journal")}
                        variant="outline"
                        size="lg"
                      >
                        View Journal
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
