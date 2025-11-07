"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/database";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Smile,
  Meh,
  Frown,
  Save,
  X,
  Loader2,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JournalEntryDetailClientProps {
  entry: JournalEntry;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const moodOptions = [
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

export default function JournalEntryDetailClient({
  entry: initialEntry,
  user,
}: JournalEntryDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialEntry.title || "");
  const [content, setContent] = useState(initialEntry.content);
  const [moodScore, setMoodScore] = useState(initialEntry.mood_score);
  const [tags, setTags] = useState(initialEntry.tags);
  const [tagInput, setTagInput] = useState("");

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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Journal entry cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/journal/${initialEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          moodScore: moodScore,
          tags: tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Entry updated!",
          description: "Your changes have been saved successfully",
        });
        setIsEditing(false);
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to update entry");
      }
    } catch (error) {
      console.error("Error updating journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to update journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/journal/${initialEntry.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Entry deleted",
          description: "Your journal entry has been deleted",
        });
        router.push("/journal");
      } else {
        throw new Error(data.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialEntry.title || "");
    setContent(initialEntry.content);
    setMoodScore(initialEntry.mood_score);
    setTags(initialEntry.tags);
    setIsEditing(false);
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
            Back to Journal
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cocoa-800 dark:text-cream-100 mb-2">
                Journal Entry
              </h1>
              <div className="flex items-center gap-3 text-cocoa-600 dark:text-cream-200">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(initialEntry.created_at)}</span>
              </div>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                {/* Mood Editor */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    How are you feeling?
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
                      Feeling:{" "}
                      <span className="font-semibold">
                        {moodOptions.find((m) => m.value === moodScore)?.label}
                      </span>
                    </p>
                  )}
                </div>

                {/* Title Editor */}
                <div>
                  <Label htmlFor="edit-title">Title (Optional)</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entry title..."
                    className="mt-2"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <Label htmlFor="edit-content">Content *</Label>
                  <Textarea
                    id="edit-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 min-h-[300px] resize-y"
                  />
                </div>

                {/* Tags Editor */}
                <div>
                  <Label htmlFor="edit-tags">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="edit-tags"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                    >
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mood Display */}
                {initialEntry.mood_score && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getMoodColor(
                      initialEntry.mood_score
                    )}`}
                  >
                    {getMoodIcon(initialEntry.mood_score)}
                    <span>
                      Mood: {initialEntry.mood_score}/10 -{" "}
                      {
                        moodOptions.find(
                          (m) => m.value === initialEntry.mood_score
                        )?.label
                      }
                    </span>
                  </div>
                )}

                {/* Title Display */}
                {initialEntry.title && (
                  <h2 className="text-2xl font-semibold text-cocoa-800 dark:text-cream-100">
                    {initialEntry.title}
                  </h2>
                )}

                {/* Content Display */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-cocoa-700 dark:text-cream-200">
                    {initialEntry.content}
                  </p>
                </div>

                {/* Tags Display */}
                {initialEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-cocoa-200 dark:border-cocoa-700">
                    <span className="text-sm font-medium text-cocoa-600 dark:text-cream-300 flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Tags:
                    </span>
                    {initialEntry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="pt-4 border-t border-cocoa-200 dark:border-cocoa-700 text-sm text-cocoa-500 dark:text-cream-300">
                  Last updated: {formatDate(initialEntry.updated_at)}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                journal entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </main>
    </div>
  );
}
