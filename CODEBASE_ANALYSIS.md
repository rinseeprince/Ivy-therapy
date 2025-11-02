# Ivy Therapy App - Comprehensive Codebase Analysis

## Executive Summary

This is a **Next.js 15 + TypeScript** therapy application that provides AI-powered voice-based therapy sessions using ElevenLabs for conversational AI. The app uses **Supabase** for authentication and database, **Tailwind CSS** for styling, and follows a modern React component-based architecture with both server and client components.

---

## 1. TECH STACK & FRAMEWORK

### Core Framework
- **Next.js**: `^15.5.5` - Modern React framework with App Router
- **React**: `^18.3.1` - UI library
- **TypeScript**: `^5` - Type safety
- **Node Runtime**: Server-side JavaScript execution

### Styling & UI
- **Tailwind CSS**: `^4.1.14` - Utility-first CSS framework
- **Framer Motion**: `^12.23.24` - Animation library
- **Lucide React**: `^0.454.0` - Icon library
- **Radix UI**: Multiple packages for accessible components
- **next-themes**: `^0.4.6` - Dark mode support

### Form & Validation
- **react-hook-form**: `^7.60.0` - Form state management
- **@hookform/resolvers**: `^3.10.0` - Form validation
- **Zod**: `3.25.76` - Schema validation

### Backend & Data
- **Supabase**: `latest` - PostgreSQL database + auth
- **OpenAI**: `^6.3.0` - GPT-4 for session summaries
- **ElevenLabs**: `@elevenlabs/react@^0.8.0` - Voice conversation
- **AI SDK**: `latest` - AI integration utilities

### Development
- **Vitest**: `^1.1.0` - Unit testing
- **@testing-library/react**: `^14.1.2` - Component testing
- **ESLint**: Linting

---

## 2. PROJECT STRUCTURE

```
Ivy-therapy-main/
├── app/                          # Next.js App Router pages & API routes
│   ├── api/                      # API endpoints
│   │   ├── sessions/
│   │   │   ├── create/
│   │   │   ├── [sessionId]/
│   │   │   │   ├── end/
│   │   │   │   ├── summarize/
│   │   │   │   └── context/
│   │   ├── elevenlabs/
│   │   │   ├── start/
│   │   │   └── end/
│   │   ├── consent/
│   │   ├── auth/
│   │   ├── cron/
│   │   └── data/                # Data export/deletion
│   ├── dashboard/               # Dashboard page
│   ├── sessions/                # Session history & detail pages
│   ├── session/new/             # Start new session page
│   ├── auth/                    # Authentication pages
│   ├── consent/                 # Consent management
│   ├── settings/                # User settings
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardPageClient.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── MoodInsightsCard.tsx
│   │   ├── RecentSessions.tsx
│   │   ├── QuickActions.tsx
│   │   ├── DidYouKnowCard.tsx
│   │   ├── DarkModeToggle.tsx
│   │   └── index.ts
│   ├── session/                 # Voice session components
│   │   └── StartSessionClient.tsx
│   ├── sessions/                # Session list/detail components
│   │   ├── SessionsPageClient.tsx
│   │   ├── SessionDetailClient.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SessionsFilter.tsx
│   │   └── SessionsStats.tsx
│   ├── hooks/                   # Custom React hooks
│   │   └── use-therapy-conversation.tsx
│   ├── ui/                      # Reusable UI components (59 components)
│   │   └── [various.tsx]        # Radix UI + custom components
│   └── [other components]
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # Server-side Supabase client
│   │   └── client.ts            # Client-side Supabase client
│   ├── auth.ts                  # Authentication utilities
│   ├── types.ts                 # TypeScript types
│   ├── consent.ts               # Consent management
│   ├── context-builder.ts       # Session context builder
│   ├── audit.ts                 # Audit logging
│   ├── utils.ts                 # Utility functions
│   └── jobs/                    # Background job handlers
│
├── supabase/
│   └── migrations/              # Database schema migrations
│       ├── 001_create_tables.sql (original)
│       ├── 20250121_consent_and_data_management.sql
│       ├── 20250121_fix_audit_rls.sql
│       ├── 20250122_remove_redundant_users_table.sql
│       └── 20250121_add_pending_deletion.sql
│
├── styles/                      # Global styles
├── public/                      # Static assets
├── types/                       # Global TypeScript definitions
├── scripts/                     # Utility scripts
├── __tests__/                   # Test files
│
├── package.json                 # Dependencies
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest configuration
│
└── Documentation files:
    ├── DASHBOARD_README.md
    ├── START_SESSION_REDESIGN.md
    ├── SESSIONS_PAGE_README.md
    ├── SESSION_DETAIL_REDESIGN.md
    ├── CONSENT_AND_DATA_MANAGEMENT.md
    └── QUICK_START.md
```

---

## 3. DATABASE SETUP

### Database System
- **Supabase** (PostgreSQL-based)
- **URL**: https://oyuovrfoikvtcedbjbwu.supabase.co
- **Authentication**: Supabase Auth with OAuth2

### Core Tables

#### 1. **users** (Supabase Auth Reference)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: User profile information (mirrors Supabase auth.users)

#### 2. **therapy_sessions** (Main Session Table)
```sql
CREATE TABLE therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  transcript JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_started_at ON therapy_sessions(started_at DESC);
```

**Fields**:
- `id`: Unique session identifier
- `user_id`: Foreign key to user
- `started_at`: Session start timestamp
- `ended_at`: Session end timestamp
- `duration_minutes`: Total session duration
- `status`: 'in_progress', 'completed', or 'cancelled'
- `transcript`: Array of transcript entries (JSONB)

**Sample Transcript Entry**:
```json
[
  {
    "role": "assistant",
    "content": "How are you feeling today?",
    "timestamp": "2025-01-31T10:00:00Z"
  },
  {
    "role": "user",
    "content": "I've been feeling stressed about work.",
    "timestamp": "2025-01-31T10:00:05Z"
  }
]
```

#### 3. **session_summaries** (Session Analysis)
```sql
CREATE TABLE session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES therapy_sessions(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_topics TEXT[],
  next_steps TEXT[],
  mood_assessment TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_summaries_session_id ON session_summaries(session_id);
```

**Fields**:
- `summary`: OpenAI-generated narrative summary
- `key_topics`: Array of main discussion topics
- `next_steps`: Array of recommended actions
- `mood_assessment`: Mood state assessment
- `therapist_notes`: AI therapist observations

#### 4. **user_consents** (Consent Management)
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  consent_text_hash TEXT NOT NULL,
  acknowledged_ai_limitations BOOLEAN NOT NULL,
  confirmed_not_emergency BOOLEAN NOT NULL,
  confirmed_age_over_18 BOOLEAN NOT NULL,
  accepted_terms_privacy BOOLEAN NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-GB',
  ip_inet INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_created_at ON user_consents(created_at DESC);
```

#### 5. **user_settings** (User Preferences & Status)
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_active_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT,
  data_retention_days INTEGER NOT NULL DEFAULT 365,
  allow_data_export BOOLEAN NOT NULL DEFAULT TRUE,
  pending_deletion BOOLEAN DEFAULT FALSE,
  deletion_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 6. **data_exports** (User Data Export Requests)
```sql
CREATE TYPE export_status AS ENUM ('queued','processing','ready','failed');

CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status export_status NOT NULL DEFAULT 'queued',
  file_path TEXT,
  error TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX idx_data_exports_status ON data_exports(status);
```

#### 7. **deletion_requests** (Account Deletion Workflow)
```sql
CREATE TYPE delete_status AS ENUM 
  ('queued','processing','completed','failed','canceled');

CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status delete_status NOT NULL DEFAULT 'queued',
  reason TEXT,
  confirmation_phrase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
```

#### 8. **privacy_audit** (Audit Logging)
```sql
CREATE TABLE privacy_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_privacy_audit_user_id ON privacy_audit(user_id);
CREATE INDEX idx_privacy_audit_event ON privacy_audit(event);
```

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- **Users**: Can only view their own records
- **Sessions**: Can only access their own sessions
- **Summaries**: Can only view summaries for their sessions
- **Settings**: Can only manage their own settings

### Migrations
Located at: `/Users/samuel.k/Desktop/Ivy-therapy-main/supabase/migrations/`

Files:
1. `001_create_tables.sql` - Initial schema
2. `20250121_consent_and_data_management.sql` - Consent & GDPR features
3. `20250121_fix_audit_rls.sql` - Audit table fixes
4. `20250122_remove_redundant_users_table.sql` - Use Supabase auth.users

---

## 4. EXISTING VOICE SESSION IMPLEMENTATION

### Voice Session Flow

#### A. Session Creation (API Route)
**Route**: `POST /api/sessions/create`
**Location**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/sessions/create/route.ts`

```typescript
// Creates session in database
POST /api/sessions/create
Response: { sessionId: UUID }
```

**Process**:
1. Authenticate user via Supabase
2. Upsert user profile in `users` table
3. Create session record in `therapy_sessions` table with:
   - `status`: 'in_progress'
   - `transcript`: []
   - `user_id`: current user ID
4. Return `sessionId` to frontend

#### B. Voice Conversation Hook
**Location**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/hooks/use-therapy-conversation.tsx`

```typescript
const {
  status,           // 'connected' | 'disconnected'
  isSpeaking,       // boolean
  isConnecting,     // boolean
  conversationId,   // string
  transcript,       // Array<{role, content, timestamp}>
  startConversation,
  endConversation,
  sendMessage,
  sendContextUpdate,
  setVolume,
  sendFeedback,
  canSendFeedback
} = useTherapyConversation({
  onTranscriptUpdate,
  onSessionStart,
  onSessionEnd,
  onError
})
```

**Implementation**:
- Uses ElevenLabs React SDK `useConversation` hook
- WebSocket connection for real-time audio
- Handles microphone permissions
- Manages transcript state

#### C. ElevenLabs Integration
**Configuration**:
```
ELEVENLABS_API_KEY=sk_06c621c47767c73f8e565233e0bc3899679ff7bac591cc1d
ELEVENLABS_AGENT_ID=agent_9601k6jtt5wread9q5sx3hxgqt1g
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_9601k6jtt5wread9q5sx3hxgqt1g
```

**Agent Initialization** (`/api/elevenlabs/start/route.ts`):
```typescript
POST /api/elevenlabs/start
Body: { sessionId, context }
Response: { conversationId }

System Prompt includes:
- Therapeutic techniques (CBT, DBT, person-centered)
- Safety guidelines (suicide prevention)
- Communication style (warm, empathetic)
- Context from previous sessions
```

#### D. Session End & Summary Generation
**Routes**:
- `POST /api/sessions/[sessionId]/end` - Save transcript & finalize session
- `POST /api/sessions/[sessionId]/summarize` - Generate OpenAI summary

**Flow**:
1. **End Session** - Save transcript to database
   ```typescript
   // Payload
   {
     transcript: Array<{role, content, timestamp}>,
     durationMinutes: number
   }
   
   // Updates therapy_sessions table
   - status: 'completed'
   - ended_at: NOW()
   - duration_minutes: calculated
   - transcript: JSON array
   ```

2. **Generate Summary** - OpenAI GPT-4
   ```typescript
   // Uses transcript to generate:
   - summary: Narrative overview (2-3 paragraphs)
   - key_topics: Array of main topics discussed
   - next_steps: Array of recommendations
   - mood_assessment: Emotional state analysis
   - therapist_notes: Observations & encouragement
   
   // Saved to session_summaries table
   ```

#### E. StartSessionClient Component
**Location**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/session/StartSessionClient.tsx`

**Features**:
- Full dashboard layout with sidebar
- Session states: idle, connecting, listening, speaking, processing, muted, ending, error
- Real-time timer (MM:SS format)
- Live transcript display
- Audio visualizer with animated orb
- Microphone permission handling
- Dark mode support

**Key States**:
```typescript
type SessionState = 
  | "idle"        // Before start
  | "connecting"  // Establishing connection
  | "connected"   // Ready
  | "listening"   // AI listening to user
  | "processing"  // AI processing
  | "speaking"    // AI speaking
  | "muted"       // Microphone muted
  | "ending"      // Preparing summary
  | "ended"       // Session ended
  | "error"       // Error state
```

---

## 5. API STRUCTURE & ROUTES

### API Route Pattern
Location: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/`

Next.js App Router convention: Route files named `route.ts`

### Complete API Routes

#### Session Management
| Route | Method | Purpose | Input | Output |
|-------|--------|---------|-------|--------|
| `/api/sessions/create` | POST | Create new session | - | `{sessionId}` |
| `/api/sessions/[sessionId]/end` | POST | Finalize session | `{transcript, durationMinutes}` | `{success}` |
| `/api/sessions/[sessionId]/summarize` | POST | Generate summary | - | `{success, summary}` |
| `/api/sessions/[sessionId]/context` | GET | Get session context | - | `{context, history}` |

#### ElevenLabs Voice
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/elevenlabs/start` | POST | Initialize conversation |
| `/api/elevenlabs/end` | POST | End conversation |

#### Authentication
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/reauth` | POST | Re-authenticate user |

#### Consent Management
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/consent/accept` | POST | Accept consent |
| `/api/consent/revoke` | POST | Revoke consent |

#### Data Management
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/data/export/request` | POST | Request data export |
| `/api/data/export/download` | GET | Download exported data |
| `/api/data/export/status` | GET | Check export status |
| `/api/data/delete/request` | POST | Request account deletion |
| `/api/data/delete/confirm` | POST | Confirm deletion |
| `/api/data/delete/status` | GET | Check deletion status |

#### Cron Jobs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cron/process-jobs` | POST | Background job processor |

#### User Settings
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/settings` | GET/POST | Get/update user settings |

### API Pattern Example
```typescript
// Standard POST endpoint
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
    
    // Parse request
    const data = await request.json()
    
    // Perform operation
    const { data: result, error } = await supabase
      .from("table_name")
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[API] Error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

---

## 6. OPENAI INTEGRATION

### Configuration
```
OPENAI_API_KEY=sk-proj-...
Model: GPT-4
```

### Location
**File**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/api/sessions/[sessionId]/summarize/route.ts`

### Usage: Session Summary Generation

**When Called**:
- After user ends a voice session
- Transcript is available from ElevenLabs conversation

**Process**:
```typescript
1. Fetch session transcript from database
2. Format transcript into readable conversation
3. Call OpenAI GPT-4 with system prompt
4. Parse JSON response
5. Save summary to session_summaries table
6. Return summary data
```

**System Prompt**:
```
You are a professional therapist writing a session summary for your patient. 
Analyze the following therapy session transcript and provide a comprehensive 
summary written directly to the patient.

Respond with a JSON object containing:
- summary: A warm, supportive overview (2-3 paragraphs)
- key_topics: Array of main topics discussed (3-5)
- next_steps: Array of personalized recommendations (2-4)
- mood_assessment: Brief assessment of emotional state
- therapist_notes: Supportive observations and encouragement

Write everything as if speaking directly to the patient. Use "you" throughout.
```

**Response Format**:
```json
{
  "summary": "During today's session, we explored your feelings about work stress...",
  "key_topics": ["Work stress", "Coping strategies", "Work-life balance"],
  "next_steps": ["Practice the breathing exercise we discussed", "Journaling daily"],
  "mood_assessment": "You showed resilience and openness today...",
  "therapist_notes": "I noticed your increased confidence when discussing solutions..."
}
```

**Parameters**:
- `model`: "gpt-4"
- `temperature`: 0.7 (balanced creativity)
- `max_tokens`: 1500

---

## 7. AUTHENTICATION & USER MANAGEMENT

### Authentication System
**Provider**: Supabase Auth
**Methods**: Email/password, OAuth (configurable)

### File Structure
- **Auth Utils**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/auth.ts`
- **Server Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/supabase/server.ts`
- **Client Client**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/supabase/client.ts`
- **Auth Pages**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/auth/`

### Key Auth Functions
```typescript
// Get current authenticated user
getCurrentUser() -> User | null

// Check if recent re-authentication
checkRecentReauth() -> boolean

// Set re-auth cookie (10 minute validity)
setReauthCookie() -> void

// Verify password
verifyPassword(password) -> boolean

// User settings with consent status
getUserSettings(userId) -> UserSettings

// Check active consent
hasActiveConsent(userId) -> boolean

// Check deletion pending
isPendingDeletion(userId) -> boolean
```

### User Schema

**Supabase Auth User**:
```typescript
{
  id: UUID,
  email: string,
  user_metadata: {
    name: string,
    avatar_url: string
  },
  created_at: timestamp,
  ...
}
```

**Custom Users Table**:
```typescript
{
  id: UUID,
  email: string,
  name: string,
  created_at: timestamp
}
```

**User Settings**:
```typescript
{
  user_id: UUID,
  has_active_consent: boolean,
  consent_version: string,
  data_retention_days: number,
  allow_data_export: boolean,
  pending_deletion: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Subscription Tiers
Currently: No tier system implemented
Default behavior: All authenticated users have full access

**Future Implementation Points**:
- Add `subscription_tier` to user_settings
- Add `tier_start_date`, `tier_end_date` for time-based access
- Create `subscription_plans` reference table

---

## 8. UI COMPONENTS & STYLING

### UI Library
**Tailwind CSS** with custom color palette

### Custom Colors (tailwind.config.ts)
```typescript
{
  cocoa: {
    50: '#F9F6F4',
    100: '#F0EAE5',
    200: '#E1D5CB',
    300: '#C8B5A5',
    400: '#A68B75',
    500: '#6B513D',
    600: '#4A3528',
    700: '#2D1810',
    800: '#1F0F0A',
    900: '#150A06'
  },
  teal: {
    50: '#F0FDF9',
    100: '#CCFBEF',
    200: '#A8E6CF',
    300: '#7FDDB8',
    400: '#5CD4A0',
    500: '#3BC689',
    600: '#2BA86F'
  },
  cream: {
    50: '#FFFFFF',
    100: '#FAF8F5',
    200: '#F5F2ED',
    300: '#EDE8E0',
    400: '#E5DFD5',
    500: '#D9D0C3'
  },
  sand: { ... },
  peach: { ... },
  lavender: { ... }
}
```

### Dark Mode
**Implementation**: `next-themes`
**Toggle Location**: `components/dashboard/DarkModeToggle.tsx`
**Root Setup**: `app/layout.tsx`

### Component Library Structure
**Location**: `/Users/samuel.k/Desktop/Ivy-therapy-main/components/`

#### Reusable UI Components (59 total)
Directory: `components/ui/`
Examples: button, card, dialog, form, input, toast, tabs, sidebar, etc.

All use **Radix UI** as base with Tailwind customization

#### Dashboard Components
- **DashboardPageClient.tsx** - Main dashboard page logic
- **DashboardSidebar.tsx** - Navigation sidebar (collapsible)
- **StatsCard.tsx** - Animated stat cards with count-up
- **MoodInsightsCard.tsx** - Mood tracking with trends
- **RecentSessions.tsx** - Last 5 sessions display
- **QuickActions.tsx** - Action cards (Start, View, Manage)
- **DidYouKnowCard.tsx** - Motivational insights
- **DarkModeToggle.tsx** - Theme switcher
- **DashboardSkeleton.tsx** - Loading states

#### Session Components
**Voice Session**:
- **StartSessionClient.tsx** (450+ lines)
  - Animated orb visualizer
  - Session states and status indicators
  - Live transcript sidebar
  - Mute/unmute controls
  - Timer display
  - Error handling

**Session History**:
- **SessionsPageClient.tsx** - Sessions list page
- **SessionDetailClient.tsx** - Session detail view
- **SessionCard.tsx** - Individual session card
- **SessionsFilter.tsx** - Filter/sort sessions
- **SessionsStats.tsx** - Session statistics

### Sidebar Navigation
**Implementation**: `components/dashboard/DashboardSidebar.tsx`

**Navigation Items**:
1. **Core**
   - Dashboard → `/dashboard`
   - Sessions → `/sessions`
   - Start Session → `/session/new`

2. **Wellness** (Placeholder for future)
   - Progress
   - Resources
   - Goals

3. **Organization**
   - Settings
   - Data Management
   - Help

**Features**:
- Collapsible (256px → 80px)
- Active route highlighting
- Tooltips when collapsed
- User profile section
- Dark mode support

### Animations
**Library**: Framer Motion

**Common Patterns**:
```typescript
// Entrance animations
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Hover effects
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Loading states
animate={{ rotate: 360 }}
transition={{ repeat: Infinity }}

// Count-up
animate={{ value: target }}
transition={{ duration: 1.5 }}
```

---

## 9. SESSION HISTORY / MY SESSIONS

### Sessions Page
**Route**: `/sessions`
**File**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/sessions/page.tsx`

**Features**:
- Fetch all user sessions (ordered by date DESC)
- Display stats: Total sessions, completed, average duration
- Session cards with:
  - Date & time
  - Duration
  - Topics discussed
  - Status badge
  - Summary preview
- Filter/sort options
- View session detail

### Session Detail Page
**Route**: `/sessions/[sessionId]`
**File**: `/Users/samuel.k/Desktop/Ivy-therapy-main/app/sessions/[sessionId]/page.tsx`

**Features**:
- Display session date & duration
- Show full summary (from OpenAI)
- Key topics discussion
- Next steps recommendations
- Mood assessment
- Therapist notes
- Transcript (if available)
- Back to sessions link
- Start new session button

### Data Fetching (Server-Side)
```typescript
// Fetch sessions with summaries
const { data: sessions } = await supabase
  .from("therapy_sessions")
  .select(`
    *,
    session_summaries (*)
  `)
  .eq("user_id", user.id)
  .order("started_at", { ascending: false })

// Access summary
session.session_summaries?.[0]?.summary
```

---

## 10. CONTEXT BUILDER FOR CONTINUITY

### Purpose
Provides AI therapist with context from previous sessions

### Implementation
**File**: `/Users/samuel.k/Desktop/Ivy-therapy-main/lib/context-builder.ts`

```typescript
async buildSessionContext(userId: string): Promise<SessionContext>
```

### Process
1. **Fetch last 3 completed sessions** with summaries
2. **Extract key information**:
   - Session date
   - Summary
   - Key topics
   - Next steps
   - Mood assessment
3. **Build context prompt** for ElevenLabs
4. **Include guidelines** for continuing therapist

### Context Output
```typescript
{
  hasHistory: boolean,
  previousSessionsCount: number,
  recentSummaries: Array<{
    date: string,
    summary: string,
    keyTopics: string[],
    nextSteps: string[],
    moodAssessment: string | null
  }>,
  contextPrompt: string // Sent to ElevenLabs
}
```

### First Session vs Returning User
**First Session**:
```
"This is the user's first therapy session.
- Introduce yourself warmly as their AI therapy companion
- Explain this is a safe, confidential space
- Ask open-ended questions to understand what brought them here
- Build rapport and establish trust
- Listen actively and validate their feelings"
```

**Returning User**:
```
"You are continuing therapy with a returning client. 
Here is their recent session history:

--- Session 3 (1/30/2025) ---
Summary: [previous summary text]
Key Topics: [topics]
Next Steps: [recommendations]
Mood Assessment: [assessment]

--- Current Session Guidelines ---
- Welcome them back warmly
- Reference relevant topics from previous sessions
- Follow up on action items from last session
- Build on the therapeutic relationship
- Notice and acknowledge progress"
```

---

## 11. KEY ARCHITECTURE DECISIONS

### Server vs Client Components
- **Server Components**: Authentication checks, data fetching, API calls
- **Client Components**: Interactive UI, hooks, form handling

### API Route Pattern
- All routes under `/app/api/`
- POST for mutations, GET for queries
- Always check authentication first
- Return standardized JSON responses

### State Management
- **React Hooks**: useState, useContext for component state
- **Custom Hooks**: useTherapyConversation for conversation logic
- **Server-side**: Supabase for persistent data

### Error Handling
- Try/catch in all API routes
- Graceful fallbacks in UI
- Console logging for debugging
- User-friendly error messages

### Security
- **RLS**: All tables have row-level security
- **Auth checks**: Every API route validates user
- **Re-auth**: Sensitive operations require recent re-auth
- **Audit logging**: Privacy-focused event tracking

---

## 12. ENVIRONMENT VARIABLES

### Required Variables (`.env.local`)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oyuovrfoikvtcedbjbwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000/
SUPABASE_SERVICE_ROLE_KEY=... (Server only)

# OpenAI
OPENAI_API_KEY=sk-proj-...

# ElevenLabs
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_...

# Security
CRON_SECRET=... (for background jobs)
```

---

## 13. FILE PATHS SUMMARY

### Critical Files for Text-Based Sessions
| File | Purpose |
|------|---------|
| `/lib/context-builder.ts` | Session context generation |
| `/lib/auth.ts` | Auth utilities |
| `/app/api/sessions/create/route.ts` | Session creation |
| `/app/api/sessions/[sessionId]/end/route.ts` | Session finalization |
| `/app/api/sessions/[sessionId]/summarize/route.ts` | Summary generation |
| `/components/session/StartSessionClient.tsx` | Voice session UI |
| `/components/dashboard/DashboardSidebar.tsx` | Navigation |
| `/lib/supabase/server.ts` | Database client |
| `/tailwind.config.ts` | Styling configuration |

### Database Schema Files
- `/supabase/migrations/001_create_tables.sql` - Core tables
- `/supabase/migrations/20250121_consent_and_data_management.sql` - GDPR features

---

## 14. NEXT STEPS FOR TEXT-BASED SESSIONS

### Implementation Strategy

1. **Create Text Session Table**
   ```sql
   CREATE TABLE text_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ended_at TIMESTAMP WITH TIME ZONE,
     duration_minutes INTEGER,
     status TEXT DEFAULT 'in_progress',
     messages JSONB DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Create Text Session Component**
   - Similar structure to `StartSessionClient.tsx`
   - Text input instead of voice
   - Message list instead of transcript
   - Use OpenAI Chat API instead of ElevenLabs

3. **Create API Routes**
   - `POST /api/text-sessions/create`
   - `POST /api/text-sessions/[sessionId]/message`
   - `POST /api/text-sessions/[sessionId]/end`
   - `POST /api/text-sessions/[sessionId]/summarize`

4. **Reuse Existing Patterns**
   - Session context builder (use same format)
   - Supabase queries (add text_sessions)
   - Authentication checks
   - Summary generation (modify for messages instead of transcript)

---

## 15. BUILD & PERFORMANCE METRICS

```
Next.js Build Time: ~3 seconds
First Load JS: 168 kB (dashboard)
Session Page: 121 kB (275 kB first load JS with voice libs)

Technologies:
- 60fps animations (GPU acceleration)
- Dark mode: instant toggle (no reload)
- Responsive: mobile-first design
- Accessibility: WCAG AA compliant
```

---

**Generated**: 2025-01-31
**Documentation Version**: 1.0
**Framework Version**: Next.js 15.5.5
