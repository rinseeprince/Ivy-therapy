"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Flame,
  Heart,
  MessageSquare,
  Clock,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ProgressStats } from "@/types/database";

interface ProgressPageClientProps {
  initialStats: ProgressStats;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function ProgressPageClient({
  initialStats,
  user,
}: ProgressPageClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMoodHistory();
  }, [timeRange]);

  const fetchMoodHistory = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
      const response = await fetch(`/api/progress/mood-history?days=${days}`);
      const data = await response.json();
      if (data.success) {
        setMoodHistory(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodTrendIcon = () => {
    switch (stats.moodStats.moodTrend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case "stable":
        return <Minus className="h-5 w-5 text-yellow-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMoodTrendColor = () => {
    switch (stats.moodStats.moodTrend) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "declining":
        return "text-red-600 bg-red-50 border-red-200";
      case "stable":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getMoodTrendLabel = () => {
    switch (stats.moodStats.moodTrend) {
      case "improving":
        return "Improving";
      case "declining":
        return "Needs Attention";
      case "stable":
        return "Stable";
      default:
        return "Insufficient Data";
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

        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
            Progress Tracking
          </h1>
          <p className="text-cocoa-600 dark:text-cream-200">
            Your mental wellness journey at a glance
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Mood Stats */}
          <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200">
            <div className="flex items-center justify-between mb-3">
              <Heart className="h-8 w-8 text-teal-600" />
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMoodTrendColor()}`}
              >
                {getMoodTrendIcon()}
                <span>{getMoodTrendLabel()}</span>
              </div>
            </div>
            <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
              Average Mood
            </p>
            <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
              {stats.moodStats.avgMood ? `${stats.moodStats.avgMood}/10` : "N/A"}
            </p>
            <p className="text-xs text-cocoa-500 dark:text-cream-300 mt-2">
              From {stats.moodStats.totalEntries} entries
            </p>
          </Card>

          {/* Journal Streak */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
              Journal Streak
            </p>
            <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
              {stats.journalStats.currentStreak} days
            </p>
            <p className="text-xs text-cocoa-500 dark:text-cream-300 mt-2">
              Longest: {stats.journalStats.longestStreak} days
            </p>
          </Card>

          {/* Total Sessions */}
          <Card className="p-6 bg-gradient-to-br from-lavender-50 to-lavender-100 dark:from-lavender-900/20 dark:to-lavender-800/20 border-lavender-200">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="h-8 w-8 text-lavender-600" />
            </div>
            <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
              Total Sessions
            </p>
            <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
              {stats.sessionStats.completedSessions}
            </p>
            <p className="text-xs text-cocoa-500 dark:text-cream-300 mt-2">
              {stats.sessionStats.sessionsThisMonth} this month
            </p>
          </Card>

          {/* Avg Session Length */}
          <Card className="p-6 bg-gradient-to-br from-sand-50 to-sand-100 dark:from-sand-900/20 dark:to-sand-800/20 border-sand-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-sand-600" />
            </div>
            <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
              Avg Session
            </p>
            <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
              {stats.sessionStats.avgDuration} min
            </p>
            <p className="text-xs text-cocoa-500 dark:text-cream-300 mt-2">
              {stats.sessionStats.sessionsThisWeek} this week
            </p>
          </Card>
        </motion.div>

        {/* Tabbed Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="mood" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mood">Mood Trends</TabsTrigger>
              <TabsTrigger value="sessions">Session Insights</TabsTrigger>
              <TabsTrigger value="journal">Journal Activity</TabsTrigger>
            </TabsList>

            {/* Mood Trends Tab */}
            <TabsContent value="mood" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-cocoa-800 dark:text-cream-100">
                    Mood Over Time
                  </h3>
                  <div className="flex gap-2">
                    {(["7d", "30d", "90d", "all"] as const).map((range) => (
                      <Button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        variant={timeRange === range ? "default" : "outline"}
                        size="sm"
                      >
                        {range === "all" ? "All" : range}
                      </Button>
                    ))}
                  </div>
                </div>

                {moodHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={moodHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString();
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgMood"
                        stroke="#2BA86F"
                        fill="#A8E6CF"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-cocoa-500 dark:text-cream-300">
                    No mood data available for this time range
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-2">
                    Mood Range
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.moodStats.minMood || "N/A"} - {stats.moodStats.maxMood || "N/A"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-2">
                    Total Entries
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.moodStats.totalEntries}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-2">
                    Trend
                  </p>
                  <div className="flex items-center gap-2">
                    {getMoodTrendIcon()}
                    <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                      {getMoodTrendLabel()}
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Session Insights Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-cocoa-800 dark:text-cream-100 mb-4">
                    Session Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cocoa-600 dark:text-cream-200">
                        Total Sessions
                      </span>
                      <span className="font-semibold text-cocoa-800 dark:text-cream-100">
                        {stats.sessionStats.totalSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cocoa-600 dark:text-cream-200">
                        Completed
                      </span>
                      <span className="font-semibold text-cocoa-800 dark:text-cream-100">
                        {stats.sessionStats.completedSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cocoa-600 dark:text-cream-200">
                        This Week
                      </span>
                      <span className="font-semibold text-cocoa-800 dark:text-cream-100">
                        {stats.sessionStats.sessionsThisWeek}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cocoa-600 dark:text-cream-200">
                        This Month
                      </span>
                      <span className="font-semibold text-cocoa-800 dark:text-cream-100">
                        {stats.sessionStats.sessionsThisMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-cocoa-200 dark:border-cocoa-700">
                      <span className="text-cocoa-600 dark:text-cream-200">
                        Avg Duration
                      </span>
                      <span className="font-semibold text-cocoa-800 dark:text-cream-100">
                        {stats.sessionStats.avgDuration} min
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-cocoa-800 dark:text-cream-100 mb-4">
                    Top Discussion Topics
                  </h3>
                  {stats.sessionStats.topTopics.length > 0 ? (
                    <div className="space-y-3">
                      {stats.sessionStats.topTopics.map((topic, index) => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-xs font-semibold text-teal-600">
                              {index + 1}
                            </span>
                            <span className="text-cocoa-700 dark:text-cream-200">
                              {topic.topic}
                            </span>
                          </div>
                          <Badge variant="secondary">{topic.count}x</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-cocoa-500 dark:text-cream-300 text-center py-8">
                      No topics tracked yet
                    </p>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Journal Activity Tab */}
            <TabsContent value="journal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <Calendar className="h-8 w-8 text-teal-600 mb-3" />
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
                    Total Entries
                  </p>
                  <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.journalStats.totalEntries}
                  </p>
                </Card>

                <Card className="p-6">
                  <Flame className="h-8 w-8 text-orange-600 mb-3" />
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.journalStats.currentStreak}
                  </p>
                </Card>

                <Card className="p-6">
                  <Award className="h-8 w-8 text-lavender-600 mb-3" />
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
                    Longest Streak
                  </p>
                  <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.journalStats.longestStreak}
                  </p>
                </Card>

                <Card className="p-6">
                  <Heart className="h-8 w-8 text-pink-600 mb-3" />
                  <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-1">
                    Avg Mood Score
                  </p>
                  <p className="text-3xl font-bold text-cocoa-800 dark:text-cream-100">
                    {stats.journalStats.avgMoodScore
                      ? `${stats.journalStats.avgMoodScore}/10`
                      : "N/A"}
                  </p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-cocoa-800 dark:text-cream-100 mb-4">
                  Weekly Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-2">
                      Entries This Week
                    </p>
                    <p className="text-4xl font-bold text-teal-600">
                      {stats.journalStats.entriesThisWeek}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cocoa-600 dark:text-cream-200 mb-2">
                      Entries This Month
                    </p>
                    <p className="text-4xl font-bold text-teal-600">
                      {stats.journalStats.entriesThisMonth}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </main>
    </div>
  );
}
