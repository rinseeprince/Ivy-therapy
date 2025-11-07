# MindfulAI - AI Therapy Platform

An AI-powered therapy platform that provides compassionate, confidential therapy sessions using conversational AI, along with comprehensive journaling and progress tracking tools.

## Features

### 🎤 Therapy Sessions
- **Voice-Based Therapy**: Natural conversations with an AI therapist powered by ElevenLabs
- **Text-Based Chat Therapy**: Alternative chat-based therapy sessions with message history
- **Session Continuity**: AI remembers previous sessions and builds on your progress
- **Intelligent Summaries**: Automatic session summaries with key topics, mood assessment, and next steps using OpenAI GPT-4
- **Session History**: Track your therapy journey with detailed session records
- **Usage Limits**: Free tier includes 3 text sessions per week; premium offers unlimited access

### 📔 Journal & Daily Check-In
- **Daily Check-In**: Quick 30-second mood tracking with optional reflection
- **Streak Tracking**: Build consistency with visual streak counters (🔥)
- **AI-Generated Prompts**: Personalized journal prompts based on recent therapy sessions
- **Mood Tracking**: 10-point mood scale with emoji-based selection
- **Tag System**: Organize entries with custom and auto-suggested tags
- **Search & Filter**: Find past reflections easily with full-text search
- **Session Linking**: Connect journal entries to specific therapy sessions

### 📊 Progress Tracking
- **Mood Trends**: Interactive charts showing emotional patterns over time (7d, 30d, 90d, all time)
- **Session Analytics**: Track total sessions, average duration, and frequency
- **Topic Analysis**: See which themes come up most in your therapy
- **Milestone Celebrations**: Automatic recognition of achievements (10 sessions, 30-day streak, etc.)
- **Exportable Data**: Download your progress data for personal records
- **Trend Detection**: AI-powered mood trend analysis (improving, stable, declining)

### 🔔 Smart Reminders
- **Check-In Banner**: Gentle reminder if you haven't checked in today
- **Dashboard Widgets**: At-a-glance view of streak, recent entries, and mood
- **Dismissable Notifications**: User-controlled reminder system

### 🔒 Privacy & Security
- **Row Level Security (RLS)**: Database-level data isolation per user
- **GDPR Compliance**: Data export, deletion requests, and consent management
- **Audit Logging**: Privacy event tracking for transparency
- **Encrypted Storage**: All data encrypted at rest
- **User Control**: Granular privacy settings and data retention options

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Framer Motion for animations
- **Charts**: Recharts for data visualization
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Services**:
  - ElevenLabs Conversational AI for voice therapy sessions
  - OpenAI GPT-4 for session summaries, journal prompts, and analysis
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. Supabase account and project
3. ElevenLabs API key and Agent ID
4. OpenAI API key (for GPT-4)

### Environment Variables

Add these to your `.env.local`:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_VOICE_ID=your_voice_id (optional)

# OpenAI
OPENAI_API_KEY=your_openai_api_key
\`\`\`

### Database Setup

Run the migration files in order using Supabase CLI or the SQL editor:

\`\`\`bash
# Link your Supabase project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
\`\`\`

Or manually run the migrations in the Supabase SQL editor:

1. `supabase/migrations/20250103_add_text_therapy_sessions.sql` - Adds text session support
2. `supabase/migrations/20250121_consent_and_data_management.sql` - GDPR compliance
3. `supabase/migrations/20250121_fix_audit_rls.sql` - Fixes audit logging security
4. `supabase/migrations/20250121_add_pending_deletion.sql` - Adds deletion tracking
5. `supabase/migrations/20250122_remove_redundant_users_table.sql` - Cleanup
6. `supabase/migrations/20250107_journal_and_progress_tracking.sql` - **Journal & Progress features**

### ElevenLabs Agent Setup

1. Create an agent in the [ElevenLabs dashboard](https://elevenlabs.io/app/conversational-ai)
2. Configure the agent with a calm, professional voice
3. Copy the Agent ID to your environment variables

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` to start using the platform.

## How It Works

### Therapy Sessions Flow

1. **Start Session**: User chooses voice or text-based therapy
2. **Context Loading**: System retrieves summaries from previous sessions to provide continuity
3. **Conversation**:
   - **Voice**: ElevenLabs Conversational AI conducts real-time therapy with WebSocket connection
   - **Text**: OpenAI GPT-4 chat with message history and context
4. **Session Recording**: Transcript is saved in real-time to the database
5. **AI Summary**: When session ends, OpenAI GPT-4 analyzes the transcript and generates:
   - Comprehensive session summary
   - Key topics discussed
   - Mood assessment
   - Actionable next steps
   - Professional therapist notes
6. **Post-Session**: Optional prompt to reflect in journal
7. **Next Session**: Context from previous summaries is automatically loaded for continuity

### Daily Check-In Flow

1. **Morning Reminder**: Banner appears on dashboard if user hasn't checked in
2. **Quick Mood Selection**: Visual 1-10 emoji-based scale (30 seconds)
3. **Optional Reflection**: AI-generated prompt or free-write (can skip)
4. **Auto-Save**: Creates journal entry tagged as "daily-check-in"
5. **Streak Update**: Increments streak counter if checked in consecutive days
6. **Dashboard Update**: Check-in card shows completion status and today's mood

### Progress Tracking

1. **Data Collection**: Aggregates mood scores from journal entries and sessions
2. **Trend Analysis**: PostgreSQL functions calculate mood trends over time
3. **Visualization**: Recharts displays interactive graphs with time range selection
4. **Insights Generation**: AI determines if mood is improving, stable, or declining
5. **Topic Analysis**: Extracts and counts most-discussed therapy topics
6. **Milestone Detection**: Automatically celebrates achievements (streaks, session counts)

## Architecture

### Database Schema

**Core Tables:**
- `therapy_sessions` - Session records with transcripts (voice + text)
- `session_summaries` - AI-generated summaries with mood scores and insights
- `journal_entries` - User journal entries with mood tracking and tags
- `progress_metrics` - Custom metric tracking (mood, anxiety, sleep, etc.)
- `user_goals` - Weekly goals with progress tracking
- `user_milestones` - Achievement tracking (streaks, session counts)

**User Management:**
- `user_settings` - Preferences, subscription tier, session limits
- `user_consents` - GDPR consent records
- `data_exports` - User data export requests and files
- `deletion_requests` - Account deletion workflow
- `privacy_audit` - Audit log for privacy events

**PostgreSQL Functions:**
- `get_journal_streak(user_id)` - Calculates current consecutive day streak
- `get_mood_stats(user_id, days)` - Aggregates mood statistics and trends
- `create_weekly_goals(user_id)` - Auto-generates personalized weekly goals

### API Routes

**Session Management:**
- `/api/sessions/create` - Create new voice therapy session
- `/api/sessions/[id]/context` - Get previous session context
- `/api/sessions/[id]/end` - End session and save transcript
- `/api/sessions/[id]/summarize` - Generate AI summary

**Text Sessions:**
- `/api/text-sessions/create` - Create new text chat session
- `/api/text-sessions/[id]/message` - Send message and get AI response
- `/api/text-sessions/[id]/complete` - Complete session with summary
- `/api/text-sessions/usage` - Check session usage limits

**Journal & Check-In:**
- `/api/journal` - GET all entries (with filters), POST new entry
- `/api/journal/[id]` - GET/PATCH/DELETE specific entry
- `/api/journal/streak` - Get current journal streak
- `/api/journal/prompts` - Get AI-generated journal prompts
- `/api/journal/check-in-status` - Check if user has checked in today

**Progress & Analytics:**
- `/api/progress/stats` - Get comprehensive progress statistics
- `/api/progress/mood-history` - Get mood data for charts

**ElevenLabs Integration:**
- `/api/elevenlabs/start` - Initialize ElevenLabs conversation
- `/api/elevenlabs/end` - End ElevenLabs conversation

**GDPR & Privacy:**
- `/api/consent/accept` - Accept privacy consent
- `/api/data/export/request` - Request user data export
- `/api/data/export/download` - Download generated export
- `/api/data/delete/request` - Request account deletion

## Security & Privacy

### Authentication & Authorization
- Supabase Auth with email/password authentication
- Row Level Security (RLS) on all database tables
- All API routes validate user authentication
- Service role key for admin operations only

### Data Protection
- Session data encrypted at rest
- HTTPS enforced for all connections
- Environment variables for sensitive keys
- No client-side storage of sensitive data

### GDPR Compliance
- ✅ User consent management with versioning
- ✅ Data export functionality (JSON format)
- ✅ Right to deletion with confirmation workflow
- ✅ Audit logging for all privacy events
- ✅ Configurable data retention periods
- ✅ IP address and user agent tracking (optional)

### Privacy Controls
- Users control their data retention settings
- Export includes all user data in readable format
- Deletion requests processed with confirmation
- Privacy audit trail for transparency

## Key Features Implemented

✅ **Core Therapy Platform**
- Voice-based therapy with ElevenLabs
- Text-based chat therapy with OpenAI GPT-4
- Session history and detailed transcripts
- AI-generated session summaries
- Context-aware conversations (session continuity)

✅ **Journaling System**
- Full CRUD journal entries
- Mood tracking (1-10 scale)
- Tag organization and search
- AI-generated writing prompts
- Session linking

✅ **Daily Check-In**
- Quick 30-second mood tracking
- Streak counter with gamification
- Smart reminder system
- Dashboard integration

✅ **Progress Tracking**
- Interactive mood trend charts (Recharts)
- Session analytics and statistics
- Topic analysis from therapy sessions
- Milestone celebrations
- Time range filtering (7d, 30d, 90d, all)

✅ **User Experience**
- Unified dashboard layout with sidebar
- Dark mode support
- Responsive design (mobile-friendly)
- Smooth animations (Framer Motion)
- Empty states and loading skeletons

✅ **Privacy & Compliance**
- GDPR-compliant data management
- User consent tracking
- Data export and deletion
- Audit logging

## Future Enhancements

### Short Term
- [ ] Resources library (articles, exercises, worksheets)
- [ ] Goal setting and habit tracking
- [ ] Weekly email summaries
- [ ] Mobile app (React Native)

### Medium Term
- [ ] Multi-language support
- [ ] Crisis detection and intervention
- [ ] Integration with wearables (sleep, heart rate)
- [ ] Customizable therapy approaches (CBT, DBT, etc.)

### Long Term
- [ ] Integration with human therapists for escalation
- [ ] Group therapy sessions
- [ ] Family/couples therapy mode
- [ ] HIPAA compliance certification
- [ ] Insurance integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

**Built with ❤️ for mental wellness**
