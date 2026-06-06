# SheLinked — CLAUDE.md

## Project Overview
SheLinked is an AI-powered career acceleration platform for women. It helps users make measurable career progress through personalized assessments, coaching, mentoring, and career roadmaps.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, custom shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (beta) with JWT strategy + credentials provider
- **AI**: Anthropic Claude (`claude-opus-4-6`) via `@anthropic-ai/sdk`
- **Hosting**: Vercel

## Project Structure
```
/app
  /(auth)/login          # Login page
  /(auth)/register       # Register page
  /(dashboard)/          # Protected dashboard layout
    dashboard/           # Main dashboard
    profile/             # Career profile
    assessment/          # Leadership assessment
    coach/               # AI Career Coach
    roadmap/             # Career Roadmap Generator
    mentor/              # AI Mentor
  /api/
    auth/[...nextauth]/  # NextAuth handlers
    auth/register/       # User registration
    profile/             # Career profile CRUD
    assessment/          # Assessment submission + AI analysis
    coach/               # AI coaching conversation
    roadmap/             # Roadmap generation
    mentor/              # Mentor conversation
/components
  /ui/                   # Base UI components (button, card, input, etc.)
  /layout/               # Navbar (sidebar desktop, drawer mobile)
/lib
  auth.ts                # NextAuth config
  prisma.ts              # Prisma client singleton
  anthropic.ts           # Anthropic client
  utils.ts               # cn() utility
/prompts
  system.ts              # All AI system prompts
/types
  index.ts               # Shared types + MentorPersona definitions
  next-auth.d.ts         # Session type extension
/prisma
  schema.prisma          # Database schema
```

## Database Models
- `User` — email/password auth
- `CareerProfile` — role, industry, experience, goals (one per user)
- `Assessment` + `AssessmentResult` — leadership questionnaire + AI analysis
- `CareerRoadmap` — AI-generated 3/6/12 month plan
- `Goal` + `GoalProgress` — goal tracking
- `CoachConversation` — AI coach chat history
- `MentorConversation` — AI mentor chat history (per persona)

## MVP Features
1. **Authentication** — sign up, sign in, sign out, protected routes
2. **Career Profile** — collects role/industry/experience/goals, powers AI features
3. **Leadership Assessment** — 10-question assessment → AI-scored results
4. **AI Career Coach** — conversational coach using profile + assessment context
5. **Career Roadmap** — AI-generated 3/6/12 month plan with strategies
6. **AI Mentor** — 4 personas (Executive Leader, Product Leader, Startup Founder, Agile Coach)

## AI System Prompt
All AI features use a shared base system prompt in `/prompts/system.ts`. Key rules:
- Never give generic advice
- Always: assess situation → identify obstacles → recommend actions → create accountability
- End every response with a recommended action

## Design Principles
- Mobile first, desktop second
- Premium, minimal, executive coaching feel
- Primary color: `#7C3AED` (purple)
- Every page answers: "What should the user do next?"
- No gamification, no social patterns, no dashboard clutter

## Future Integrations (placeholder only)
- HyperMind: Community, Forums, Events, Networking, Marketplace, Corporate Dashboards

## Development Setup
```bash
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY
npx prisma generate
npx prisma db push
npm run dev
```
