# SheLinked

> AI-powered career acceleration platform for women.

SheLinked helps women accelerate their careers and become stronger leaders, product managers, executives, consultants, and entrepreneurs through personalized AI coaching, mentoring, and career roadmaps.

## Features

- **Leadership Assessment** — Understand your strengths, growth areas, and promotion readiness
- **AI Career Coach** — Direct, strategic coaching tailored to your specific situation  
- **Career Roadmap** — Personalized 3, 6, and 12-month plans with measurable milestones
- **AI Mentor** — Four expert personas: Executive Leader, Product Leader, Startup Founder, Agile Coach
- **Career Profile** — Powers all AI features with your context

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + custom UI components
- **PostgreSQL** + Prisma ORM
- **NextAuth v5** (credentials + JWT)
- **Anthropic Claude** (`claude-opus-4-6`)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | Anthropic API key |

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in your Vercel project settings.

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for full architecture documentation.

## Future Integrations

Community, forums, events, networking, marketplace, and corporate dashboards will be integrated through **HyperMind** in a future phase.

---

Built with ❤️ for women who lead.
