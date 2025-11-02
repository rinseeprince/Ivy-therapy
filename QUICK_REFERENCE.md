# Quick Reference - Key File Locations & Code Patterns

## File Paths - Copy-Paste Ready

### Core Application Files
- **Main Layout**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/layout.tsx`
- **Package.json**: `/Users/samuel.k/Desktop/Ivy-therapy-main/package.json`
- **TypeScript Config**: `/Users/samuel.k/Desktop/Ivy-therapy-main/tsconfig.json`
- **Tailwind Config**: `/Users/samuel.k/Desktop/Ivy-therapy-main/tailwind.config.ts`
- **Next.js Config**: `/Users/samuel.k/Desktop/Ivy-therapy-main/next.config.mjs`

### Database & Schema
- **Initial Schema**: `/Users/samuel.k/Desktop/Ivy-therapy-main/scripts/001_create_tables.sql`
- **Consent & GDPR**: `/Users/samuel.k/Desktop/Ivy-therapy-main/supabase/migrations/20250121_consent_and_data_management.sql`
- **Migrations Directory**: `/Users/samuel.k/Desktop/Ivy-therapy-main/supabase/migrations/`

### API Routes
- **Session Create**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/sessions/create/route.ts`
- **Session End**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/sessions/[sessionId]/end/route.ts`
- **Session Summarize**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/sessions/[sessionId]/summarize/route.ts`
- **ElevenLabs Start**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/elevenlabs/start/route.ts`
- **API Directory**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/`

### Components - Voice Sessions
- **Start Session Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/session/StartSessionClient.tsx`
- **Session Page**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/session/new/page.tsx`

### Components - Session History
- **Sessions Page**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/sessions/page.tsx`
- **Sessions Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/sessions/SessionsPageClient.tsx`
- **Session Detail Page**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/sessions/[sessionId]/page.tsx`
- **Session Detail Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/sessions/SessionDetailClient.tsx`

### Components - Dashboard
- **Dashboard Page**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/dashboard/page.tsx`
- **Dashboard Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/dashboard/DashboardPageClient.tsx`
- **Dashboard Sidebar**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/dashboard/DashboardSidebar.tsx`

### Utilities & Hooks
- **Therapy Conversation Hook**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/hooks/use-therapy-conversation.tsx`
- **Context Builder**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/context-builder.ts`
- **Auth Utilities**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/auth.ts`
- **Supabase Server**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/supabase/server.ts`
- **Supabase Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/supabase/client.ts`
- **Types**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/types.ts`

### UI Components Directory
- **All UI Components**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/ui/`
- **Dashboard Components**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/dashboard/`
- **Session Components**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/session/`
- **Sessions Components**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/sessions/`

---

## Code Patterns - Copy & Adapt

### Creating a New API Route
**Location**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/new-feature/route.ts`

```typescript
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const data = await request.json()

    // Perform database operation
    const { data: result, error } = await supabase
      .from("your_table")
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    console.log("[API] Operation successful")
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[API] Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
```

### Fetching Data in Server Components
```typescript
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function MyPage() {
  const supabase = await getSupabaseServerClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch data
  const { data: items, error } = await supabase
    .from("your_table")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error:", error)
    return <div>Error loading data</div>
  }

  return (
    <ClientComponent 
      user={user}
      items={items}
    />
  )
}
```

### Client Component with Auth Check
```typescript
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  user: {
    name: string
    email: string
  }
  data: any[]
}

export function MyClientComponent({ user, data }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/some-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ /* data */ })
      })

      if (!response.ok) throw new Error("Failed")
      
      const result = await response.json()
      router.push("/success")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={handleAction} disabled={isLoading}>
        {isLoading ? "Loading..." : "Click me"}
      </button>
    </div>
  )
}
```

### Using Tailwind Custom Colors
```tsx
// Cocoa colors
<div className="bg-cocoa-100 text-cocoa-700 dark:bg-cocoa-800 dark:text-cream-100">
  Content
</div>

// Teal accents
<div className="bg-teal-500 text-white hover:bg-teal-600">
  Button
</div>

// Cream backgrounds
<div className="bg-cream-100 dark:bg-cocoa-900">
  Light background
</div>
```

### Using Framer Motion
```tsx
import { motion } from "framer-motion"

export function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="..."
    >
      Content
    </motion.div>
  )
}
```

### Custom Hook Pattern
```typescript
import { useState, useCallback } from "react"

export function useMyFeature() {
  const [state, setState] = useState(false)

  const toggle = useCallback(() => {
    setState(prev => !prev)
  }, [])

  return { state, toggle }
}
```

---

## Database Patterns

### Fetch User Sessions
```typescript
const { data: sessions } = await supabase
  .from("therapy_sessions")
  .select(`
    *,
    session_summaries (*)
  `)
  .eq("user_id", user.id)
  .order("started_at", { ascending: false })
  .limit(10)
```

### Create Session
```typescript
const { data: session, error } = await supabase
  .from("therapy_sessions")
  .insert({
    user_id: user.id,
    status: "in_progress",
    transcript: [],
  })
  .select()
  .single()
```

### Update Session (End)
```typescript
const { error } = await supabase
  .from("therapy_sessions")
  .update({
    status: "completed",
    ended_at: new Date().toISOString(),
    duration_minutes: Math.floor(elapsedTime / 60),
    transcript: conversationTranscript,
  })
  .eq("id", sessionId)
```

### Save Summary
```typescript
const { error } = await supabase
  .from("session_summaries")
  .insert({
    session_id: sessionId,
    summary: summaryData.summary,
    key_topics: summaryData.key_topics,
    next_steps: summaryData.next_steps,
    mood_assessment: summaryData.mood_assessment,
    therapist_notes: summaryData.therapist_notes,
  })
```

---

## Important Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oyuovrfoikvtcedbjbwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key here]
SUPABASE_SERVICE_ROLE_KEY=[service role key]

# OpenAI
OPENAI_API_KEY=sk-proj-[key here]

# ElevenLabs
ELEVENLABS_API_KEY=sk_[key here]
ELEVENLABS_AGENT_ID=agent_[id here]
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_[id here]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000/
CRON_SECRET=[random string]
```

---

## Color Palette Reference

### Cocoa (Primary/Text)
- cocoa-50: #F9F6F4
- cocoa-100: #F0EAE5
- cocoa-700: #2D1810 (main text)
- cocoa-900: #150A06 (dark mode background)

### Teal (Accents)
- teal-100: #CCFBEF
- teal-500: #3BC689 (main accent)
- teal-600: #2BA86F

### Cream (Backgrounds)
- cream-50: #FFFFFF
- cream-100: #FAF8F5 (light background)
- cream-500: #D9D0C3

---

## Command Reference

```bash
# Development
npm run dev
# Visit http://localhost:3000

# Build
npm run build

# Production
npm start

# Testing
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
```

---

## Database Migration Process

```bash
# View current schema in Supabase dashboard
# Or run migrations:

supabase migration new your_feature_name
# Creates new migration file

# Apply migrations
supabase migration up
```

---

## Tips for Implementation

1. **Always check auth first** - Every API route should verify user is authenticated
2. **Use TypeScript** - Define interfaces for all data structures
3. **Follow naming conventions** - `useFeature` for hooks, `FeatureComponent` for components
4. **Reuse existing patterns** - Use StartSessionClient as template for new session types
5. **Test in dark mode** - Remember to test dark mode compatibility
6. **Mobile responsive** - Use Tailwind breakpoints (md:, lg:, etc)
7. **Error handling** - Always wrap API calls in try/catch
8. **Console logging** - Use `[Feature] message` format for easy debugging

---

Generated: 2025-01-31
Version: 1.0
