"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Tag,
  Smile,
  Frown,
  Meh,
  Clock,
  TrendingUp,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";

interface JournalPageClientProps {
  initialEntries: JournalEntry[];
  currentStreak: number;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function JournalPageClient({
  initialEntries,
  currentStreak,
  user,
}: JournalPageClientProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<{ min?: number; max?: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get all unique tags
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags))
  ).sort();

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = entry.content.toLowerCase().includes(query);
      const matchesTitle = entry.title?.toLowerCase().includes(query);
      if (!matchesContent && !matchesTitle) return false;
    }

    // Tag filter
    if (selectedTag && !entry.tags.includes(selectedTag)) {
      return false;
    }

    // Mood filter
    if (moodFilter.min && (!entry.mood_score || entry.mood_score < moodFilter.min)) {
      return false;
    }
    if (moodFilter.max && (!entry.mood_score || entry.mood_score > moodFilter.max)) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const totalEntries = entries.length;
  const entriesThisWeek = entries.filter((entry) => {
    const entryDate = new Date(entry.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const avgMood =
    entries.filter((e) => e.mood_score).length > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + (e.mood_score || 0), 0) /
            entries.filter((e) => e.mood_score).length) *
            10
        ) / 10
      : null;

  const getMoodIcon = (score: number) => {
    if (score >= 7) return <Smile className="h-5 w-5 text-teal-600" />;
    if (score >= 4) return <Meh className="h-5 w-5 text-yellow-600" />;
    return <Frown className="h-5 w-5 text-orange-600" />;
  };

  const getMoodColor = (score: number) => {
    if (score >= 7) return "bg-teal-100 text-teal-700 border-teal-300";
    if (score >= 4) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-orange-100 text-orange-700 border-orange-300";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
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

        <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
                Journal Entries
              </h1>
              <p className="text-cocoa-600 dark:text-cream-200">
                Your personal reflection space
              </p>
            </div>
            <Button
              onClick={() => router.push("/journal/new")}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-cocoa-600 dark:text-cream-200">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {currentStreak} days
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-peach-50 to-peach-100 dark:from-peach-900/20 dark:to-peach-800/20 border-peach-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-peach-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-cocoa-600 dark:text-cream-200">
                    Total Entries
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {totalEntries}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-lavender-50 to-lavender-100 dark:from-lavender-900/20 dark:to-lavender-800/20 border-lavender-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lavender-600 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-cocoa-600 dark:text-cream-200">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {entriesThisWeek}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-sand-50 to-sand-100 dark:from-sand-900/20 dark:to-sand-800/20 border-sand-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sand-600 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-cocoa-600 dark:text-cream-200">
                    Avg Mood
                  </p>
                  <p className="text-2xl font-bold text-cocoa-800 dark:text-cream-100">
                    {avgMood ? `${avgMood}/10` : "N/A"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {allTags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {selectedTag && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Entries Timeline */}
        <AnimatePresence mode="popLayout">
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full flex items-center justify-center">
                <Calendar className="h-12 w-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-semibold text-cocoa-800 dark:text-cream-100 mb-2">
                {entries.length === 0
                  ? "Start Your Journey"
                  : "No matching entries"}
              </h3>
              <p className="text-cocoa-600 dark:text-cream-200 mb-6">
                {entries.length === 0
                  ? "Write your first journal entry to begin tracking your mental health journey"
                  : "Try adjusting your filters or search query"}
              </p>
              <Button
                onClick={() => router.push("/journal/new")}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Entry
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-teal-400"
                    onClick={() => router.push(`/journal/${entry.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-cocoa-500 dark:text-cream-300">
                            {formatDate(entry.created_at)}
                          </span>
                          {entry.mood_score && (
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(
                                entry.mood_score
                              )}`}
                            >
                              {getMoodIcon(entry.mood_score)}
                              <span>{entry.mood_score}/10</span>
                            </div>
                          )}
                        </div>
                        {entry.title && (
                          <h3 className="text-xl font-semibold text-cocoa-800 dark:text-cream-100 mb-2">
                            {entry.title}
                          </h3>
                        )}
                        <p className="text-cocoa-600 dark:text-cream-200 line-clamp-3">
                          {entry.content}
                        </p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
