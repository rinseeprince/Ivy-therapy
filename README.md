# MindfulAI - AI Therapy Platform

An AI-powered therapy platform that provides compassionate, confidential therapy sessions using conversational AI.

## Features

- **Voice-Based Therapy Sessions**: Natural conversations with an AI therapist powered by ElevenLabs
- **Session Continuity**: AI remembers previous sessions and builds on your progress
- **Intelligent Summaries**: Automatic session summaries with key topics, mood assessment, and next steps using OpenAI GPT-5
- **Session History**: Track your therapy journey with detailed session records
- **Privacy & Security**: All sessions are encrypted and confidential with Row Level Security

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - ElevenLabs Conversational AI for voice therapy sessions
  - OpenAI GPT-5 for session summaries and analysis
- **Authentication**: Supabase Auth (ready to implement)

## Getting Started

### Prerequisites

1. Supabase account and project
2. ElevenLabs API key and Agent ID
3. OpenAI API key (for GPT-5)

### Environment Variables

Add these to your Vercel project or `.env.local`:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_VOICE_ID=your_voice_id (optional)

# OpenAI (via Vercel AI Gateway)
# No API key needed - handled automatically by Vercel
\`\`\`

### Database Setup

1. Connect your Supabase integration in the v0 sidebar
2. Run the SQL scripts in the `scripts` folder:
   - `001_create_tables.sql` - Creates the database schema
   - `002_seed_demo_user.sql` - Creates a demo user (optional)

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

1. **Start Session**: User clicks "Start Session" to begin a therapy conversation
2. **Context Loading**: System retrieves summaries from previous sessions to provide continuity
3. **Voice Conversation**: ElevenLabs Conversational AI conducts the therapy session with full context
4. **Session Recording**: Transcript is saved in real-time to the database
5. **AI Summary**: When session ends, OpenAI GPT-5 analyzes the transcript and generates:
   - Comprehensive session summary
   - Key topics discussed
   - Mood assessment
   - Actionable next steps
   - Professional therapist notes
6. **Next Session**: Context from previous summaries is automatically loaded for continuity

## Architecture

### Database Schema

- `users` - User accounts
- `therapy_sessions` - Session records with transcripts
- `session_summaries` - AI-generated summaries and insights

### API Routes

- `/api/sessions/create` - Create new therapy session
- `/api/sessions/[id]/context` - Get previous session context
- `/api/sessions/[id]/end` - End session and save transcript
- `/api/sessions/[id]/summarize` - Generate AI summary
- `/api/elevenlabs/start` - Initialize ElevenLabs conversation
- `/api/elevenlabs/end` - End ElevenLabs conversation

## Security & Privacy

- Row Level Security (RLS) ensures users can only access their own data
- All API routes validate user permissions
- Session data is encrypted at rest
- HIPAA-compliant infrastructure ready (requires additional configuration)

## Future Enhancements

- User authentication with Supabase Auth
- Multi-language support
- Crisis detection and intervention
- Progress tracking and analytics
- Export session summaries
- Integration with human therapists for escalation

## License

MIT
