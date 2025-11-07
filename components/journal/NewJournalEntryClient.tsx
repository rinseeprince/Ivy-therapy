"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Tag as TagIcon,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: 1, emoji: "😢", label: "Terrible", color: "bg-red-500" },
  { value: 2, emoji: "😞", label: "Bad", color: "bg-orange-500" },
  { value: 3, emoji: "😕", label: "Poor", color: "bg-orange-400" },
  { value: 4, emoji: "😐", label: "Okay", color: "bg-yellow-500" },
  { value: 5, emoji: "🙂", label: "Fine", color: "bg-yellow-400" },
  { value: 6, emoji: "😊", label: "Good", color: "bg-lime-500" },
  { value: 7, emoji: "😄", label: "Great", color: "bg-green-500" },
  { value: 8, emoji: "😁", label: "Very Good", color: "bg-teal-500" },
  { value: 9, emoji: "🤗", label: "Excellent", color: "bg-teal-600" },
  { value: 10, emoji: "🥳", label: "Amazing", color: "bg-teal-700" },
];

interface NewJournalEntryClientProps {
  sessionId?: string;
  initialPrompt?: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function NewJournalEntryClient({
  sessionId,
  initialPrompt,
  user,
}: NewJournalEntryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(initialPrompt || "");
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch AI prompts on mount
  useEffect(() => {
    fetchAIPrompts();
  }, []);

  const fetchAIPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const response = await fetch("/api/journal/prompts");
      const data = await response.json();
      if (data.success && data.prompts) {
        setAiPrompts(data.prompts);
      }
    } catch (error) {
      console.error("Error fetching AI prompts:", error);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    if (!content || content === initialPrompt) {
      setContent(`${prompt}\n\n`);
    } else {
      setContent(`${content}\n\n${prompt}\n\n`);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || null,
          title: title.trim() || null,
          content: content.trim(),
          moodScore: moodScore,
          tags: tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Entry saved!",
          description: "Your journal entry has been saved successfully",
        });
        router.push("/journal");
      } else {
        throw new Error(data.error || "Failed to save entry");
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
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

        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
            New Journal Entry
          </h1>
          <p className="text-cocoa-600 dark:text-cream-200">
            Take a moment to reflect on your thoughts and feelings
          </p>
        </motion.div>

        {/* AI Prompts */}
        {aiPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-cocoa-800 dark:text-cream-100">
                  Suggested Prompts
                </h3>
              </div>
              <div className="space-y-2">
                {aiPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="w-full text-left p-3 bg-white dark:bg-cocoa-800 rounded-lg hover:bg-teal-50 dark:hover:bg-cocoa-700 transition-colors text-sm text-cocoa-700 dark:text-cream-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">
              How are you feeling? (Optional)
            </Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setMoodScore(mood.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    moodScore === mood.value
                      ? `${mood.color} scale-110 shadow-lg`
                      : "bg-gray-100 dark:bg-cocoa-700 hover:scale-105"
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.value}</span>
                </button>
              ))}
            </div>
            {moodScore && (
              <p className="text-center mt-4 text-sm text-cocoa-600 dark:text-cream-200">
                You're feeling:{" "}
                <span className="font-semibold">
                  {moodOptions.find((m) => m.value === moodScore)?.label}
                </span>
              </p>
            )}
          </Card>
        </motion.div>

        {/* Entry Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">
                  What's on your mind? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 min-h-[300px] resize-y"
                />
                <p className="text-xs text-cocoa-500 dark:text-cream-300 mt-1">
                  {content.length} characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <TagIcon className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 mt-6"
        >
          <Button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
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
                <Save className="h-5 w-5 mr-2" />
                Save Entry
              </>
            )}
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </motion.div>
        </div>
      </main>
    </div>
  );
}
