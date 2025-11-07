import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AIPromptResponse } from "@/types/database";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /api/journal/prompts - Get AI-generated journal prompts
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get recent session summaries
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("therapy_sessions")
      .select(
        `
        id,
        started_at,
        session_summaries (
          summary,
          key_topics,
          next_steps
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(3);

    if (sessionsError) {
      console.error("Error fetching recent sessions:", sessionsError);
    }

    // Get recent journal entries to avoid repetitive prompts
    const { data: recentEntries, error: entriesError } = await supabase
      .from("journal_entries")
      .select("tags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (entriesError) {
      console.error("Error fetching recent entries:", entriesError);
    }

    // Build context for AI
    let context = "You are a helpful therapy journal assistant. Generate 3 thoughtful journal prompts for the user.\n\n";

    if (recentSessions && recentSessions.length > 0) {
      context += "Recent therapy session topics:\n";
      recentSessions.forEach((session: any) => {
        if (session.session_summaries && session.session_summaries.length > 0) {
          const summary = session.session_summaries[0];
          if (summary.key_topics && summary.key_topics.length > 0) {
            context += `- ${summary.key_topics.join(", ")}\n`;
          }
          if (summary.next_steps && summary.next_steps.length > 0) {
            context += `  Action items: ${summary.next_steps.join(", ")}\n`;
          }
        }
      });
      context += "\n";
    }

    if (recentEntries && recentEntries.length > 0) {
      const recentTags = recentEntries
        .flatMap((entry: any) => entry.tags || [])
        .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index)
        .slice(0, 5);
      if (recentTags.length > 0) {
        context += `Recent journal themes: ${recentTags.join(", ")}\n\n`;
      }
    }

    context += `Generate 3 diverse journal prompts that:
1. Help the user reflect on their therapy progress or recent sessions (if applicable)
2. Encourage self-discovery and emotional awareness
3. Are specific and actionable (not generic like "how are you feeling?")
4. Are varied in focus (e.g., one about progress, one about challenges, one about gratitude or growth)

Format: Return ONLY 3 prompts, one per line, without numbering or bullet points.`;

    // Call OpenAI to generate prompts
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a compassionate therapy journal assistant helping users reflect on their mental health journey.",
        },
        {
          role: "user",
          content: context,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const generatedText = completion.choices[0]?.message?.content || "";
    const prompts = generatedText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, 3);

    // Fallback prompts if AI generation fails
    const fallbackPrompts = [
      "What's one thing from your recent therapy session that's still on your mind? Why do you think it resonated with you?",
      "Describe a moment this week where you noticed yourself using a coping strategy or insight from therapy. How did it feel?",
      "What's one small step you can take toward a goal you discussed in therapy? What might get in your way, and how can you prepare for it?",
    ];

    const response: AIPromptResponse = {
      success: true,
      prompts: prompts.length >= 3 ? prompts : fallbackPrompts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/journal/prompts:", error);

    // Return fallback prompts on error
    const fallbackPrompts = [
      "What's one thing from your recent therapy session that's still on your mind? Why do you think it resonated with you?",
      "Describe a moment this week where you noticed yourself using a coping strategy or insight from therapy. How did it feel?",
      "What's one small step you can take toward a goal you discussed in therapy? What might get in your way, and how can you prepare for it?",
    ];

    return NextResponse.json({
      success: true,
      prompts: fallbackPrompts,
    });
  }
}
