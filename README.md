# CafeStake — Invest in the places you love

A community investing platform for local businesses (cafes, bakeries, salons, restaurants, gyms) to raise growth funding directly from their loyal customers.

**Demo project. Not a real investment offer. Payments and KYC are simulated.**

## Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase for Postgres, Auth and Realtime
- Anthropic API (or alternative) for AI-powered campaign generation, Q&A, and compliance checks
- Deploy target: Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase Setup

Create a Supabase project at [supabase.com](https://supabase.com) and copy the Project URL and anon key from Settings → API.

Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → paste → Run):

```sql
-- This migration is already in supabase/migrations/001_initial.sql
-- You can run it via the Supabase dashboard CLI or copy-paste
```

Or use the migration file:
```bash
# Copy the SQL from supabase/migrations/001_initial.sql and run in Supabase SQL Editor
```

### 3. Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key  # or use Groq, OpenRouter, etc.
RESEND_API_KEY=your-resend-key  # optional, for email notifications
```

### 4. Seed the Database

```bash
npx tsx supabase/seed.ts
```

This creates:
- 3 demo campaigns (cafe, bakery, salon in Pune)
- Demo owner account: `demo.owner@cafestake.io` / `Demo1234!`
- Demo investor account: `demo.investor@cafestake.io` / `Demo1234!`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

Use the one-click "Demo owner" and "Demo investor" buttons in the header, or sign in manually:

- **Owner**: demo.owner@cafestake.io / `Demo1234!`
- **Investor**: demo.investor@cafestake.io / `Demo1234!`

## AI Features

The app uses AI for three features:

1. **Campaign Generator**: Owners input a rough pitch, AI generates a complete campaign with story, terms, FAQs, and offer document
2. **Investor Q&A**: Chat widget on campaign pages answers questions from the offer document
3. **Compliance Check**: Screens campaigns for risky language before publishing

### AI Engine: Google Gemma 4 (via OpenRouter)

All 3 AI features are powered by **Google Gemma 4 31B** (`google/gemma-4-31b-it:free`):
1. Sign up / grab an API key from [openrouter.ai](https://openrouter.ai/keys)
2. Add `OPENROUTER_API_KEY=your_key_here` in `.env.local`
3. Default model is `google/gemma-4-31b-it:free` (configurable via `GEMMA_MODEL` in `.env.local`)

*Note: If no API key is set in `.env.local`, intelligent local fallback generators simulate all three features so the app remains demo-ready without crashing.*

## Project Structure

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Landing page
├── login/              # Sign-in page
├── signup/             # Sign-up page
├── campaigns/          # Campaign feed and detail (TODO)
├── dashboard/          # Owner dashboard (TODO)
├── portfolio/          # Investor portfolio (TODO)
├── create-campaign/    # Campaign creation flow (TODO)
└── invest/             # Investment flow (TODO)

components/
├── ui/                 # shadcn/ui components
├── DemoBanner.tsx      # Demo warning banner
├── Header.tsx          # Navigation header
├── Footer.tsx          # Footer
├── AuthForm.tsx        # Login/signup form
└── DemoLogin.tsx       # One-click demo login

lib/
├── supabase.ts         # Client Supabase instance
├── supabase-server.ts  # Server-side Supabase client
├── supabase-admin.ts   # Admin client (bypasses RLS)
├── prompts.ts          # AI prompts for all features
├── validate.ts         # Zod schemas
└── utils.ts            # Utility functions

supabase/
├── migrations/         # Database migrations
└── seed.ts            # Seed script for demo data
```

## Database Schema

- **campaigns**: Business campaigns with terms, story, risk summary
- **investments**: User investments in campaigns
- **notifications**: Real-time notifications for owners

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Development Status

**Stage 1 (Complete)**: Project setup, Supabase schema, auth, landing page, demo login

**Remaining Stages**:
- Stage 2: Campaign feed and detail pages
- Stage 3: Invest flow and notifications
- Stage 4: AI campaign generator
- Stage 5: AI compliance check
- Stage 6: AI investor Q&A chat
- Stage 7: Polish and mobile optimization
