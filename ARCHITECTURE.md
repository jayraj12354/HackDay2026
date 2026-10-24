# CafeStake — Component Architecture

## Layer 0: shadcn primitives
`Button`, `Card`, `Badge`, `Toast`, `Input`, `Label`, `Progress`, `Separator`, `Skeleton`, `Select`, `Alert`, `Dialog`, `Alert-Dialog`, `Textarea`

## Layer 1: Global layout
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 1 | `DemoBanner` | Amber demo strip on every page | none |
| 2 | `Header` | Sticky nav, auth state, demo login | `DemoLogin`, `useAuth` |
| 3 | `Footer` | Trust + demo note | none |

## Layer 2: Auth
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 4 | `DemoLogin` | One-click demo owner/investor buttons | supabase |
| 5 | `AuthForm` | Email/password login/signup | supabase, `Button`, `Input` |

## Layer 3: Campaign display
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 6 | `CampaignCard` | Grid card (title, city, progress, investors) | `Progress`, `Badge`, `formatINR` |
| 7 | `CampaignDetail` | Full detail page wrapper | all below |
| 8 | `UseOfFunds` | Breakdown list with amounts | `formatINR` |
| 9 | `TermsCard` | Revenue share terms display | none |
| 10 | `RiskSummaryBox` | "Risks to know before investing" | none |
| 11 | `FAQSection` | Accordion FAQs | none |

## Layer 4: Invest flow
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 12 | `InvestModal` | Amount selection + simulated payment | `Button`, `Input` |
| 13 | `InvestSuccess` | Success confirmation | none |

## Layer 5: Owner dashboard
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 14 | `Dashboard` | Owner home: stats + campaign list | `CampaignsTable`, `NotificationBell` |
| 15 | `CampaignsTable` | Owner's campaigns list | `Badge`, `formatINR` |
| 16 | `InvestorsTable` | Investors per campaign | none |
| 17 | `NotificationBell` | Realtime bell + dropdown | `useNotifications` |
| 18 | `CreateCampaignWizard` | 4-step wizard | `PitchForm`, `CampaignDraftEditor`, `ComplianceCheck` |
| 19 | `PitchForm` | Step 1: rough pitch inputs | `Button`, `Input`, `Select` |
| 20 | `CampaignDraftEditor` | Step 2: editable AI draft | `Textarea`, `Input` |
| 21 | `ComplianceCheck` | Step 3: compliance gate | `Badge`, flags table |

## Layer 6: Investor portfolio
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 22 | `Portfolio` | Investor investments list | `CampaignCard`-like row |

## Layer 7: AI chat
| # | Component | Purpose | Depends on |
|---|---|---|---|
| 23 | `ChatWidget` | Investor Q&A chat, streaming, chips | fetch `/api/ai/investor-qa` |

## Layer 8: Hooks
| # | Hook | Purpose |
|---|---|---|
| 24 | `useAuth` | Current user + role (client) |
| 25 | `useNotifications` | Realtime notifications + unread count |

## Layer 9: Lib
| # | File | Purpose |
|---|---|---|
| 26 | `lib/supabase.ts` | Server + admin + public clients |
| 27 | `lib/utils.ts` | `formatINR`, `formatINRFull`, `cn`, `slugify` |
| 28 | `lib/validate.ts` | Zod schemas (Campaign, ComplianceCheck, GenerateCampaign, InvestorQA) |
| 29 | `lib/prompts.ts` | AI system prompts (single file) |

## Layer 10: API routes
| # | Route | Purpose |
|---|---|---|
| 30 | `app/api/ai/generate-campaign/route.ts` | AI 1: rough pitch → campaign JSON |
| 31 | `app/api/ai/investor-qa/route.ts` | AI 2: investor Q&A (streaming) |
| 32 | `app/api/ai/compliance-check/route.ts` | AI 3: compliance gate |
| 33 | `app/api/invest/route.ts` | Server action: invest + notify + realtime |

## Layer 11: Pages
| # | Page | Purpose |
|---|---|---|
| 34 | `app/page.tsx` | Landing: hero, how it works, featured campaigns |
| 35 | `app/campaigns/page.tsx` | Campaign feed with category filter |
| 36 | `app/campaigns/[id]/page.tsx` | Campaign detail |
| 37 | `app/login/page.tsx` | Login |
| 38 | `app/signup/page.tsx` | Signup |
| 39 | `app/dashboard/page.tsx` | Owner dashboard |
| 40 | `app/portfolio/page.tsx` | Investor portfolio |
| 41 | `app/create-campaign/page.tsx` | Create wizard |

## Layer 12: Seed
| # | File | Purpose |
|---|---|---|
| 42 | `supabase/seed.ts` | 3 Pune businesses + demo accounts |
---

# Project: CafeStake — community investing in local businesses (hackathon MVP)

I'm building this in under 10 hours for a hackathon. Please build a working, demo-ready React website. Speed and a smooth demo matter more than completeness. Start by writing a short plan (files, data model, build order), then build in stages and commit after each stage so there is always a working version.

## The idea
Local businesses (cafes, bakeries, salons, restaurants, gyms) raise growth funding directly from their own loyal customers instead of a bank. Example: a cafe needs ₹50 lakh for a second outlet, and 500 regulars invest ₹10,000 each. The business gets capital, and customers get a financial stake (modelled as a revenue-share note) and a deeper connection to the place. The platform earns fees for arranging compliant financing. This needs proper regulation, investor protection and clear risk disclosure, so the product must show that thinking.

IMPORTANT: this is a demo. Show a visible footer/banner on every page: "Demo project. Not a real investment offer. Payments and KYC are simulated."

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase for Postgres, Auth and Realtime (if Supabase isn't set up yet, tell me exactly what to create and which env vars to fill in)
- Anthropic API (model: claude-sonnet-5-5) called ONLY from server routes, never from the browser. Key in ANTHROPIC_API_KEY.
- Deploy target: Vercel. Mobile-first responsive design that also looks good on a projector.

## Users and roles
1. Business owner: creates and manages campaigns, sees investors and notifications.
2. Investor: browses campaigns, asks questions, invests.
Sign-up/login with email + password, with a role chosen at sign-up. Add a one-click "Demo login" for each role so I can switch quickly while presenting.

## Screens
1. Landing page: hook line "Invest in the places you love.", how it works in 3 steps, featured campaigns.
2. Campaign feed: cards with business name, category, city, progress bar (raised vs goal), number of investors, minimum ticket. Filter by category.
3. Campaign detail: story, use of funds, terms, FAQs, risk summary box, progress, "Invest ₹10,000" button, and the investor Q&A chat widget.
4. Invest flow: amount selection, fake payment screen, success screen. No real payments.
5. Owner dashboard: my campaigns, investors list, funds raised, notification bell, "Create campaign" button.
6. Create campaign: short rough-pitch form, then AI-generated draft the owner can edit, then compliance check, then Publish.
7. Investor portfolio: my investments and their status.

## The three AI features (core of the project)

### AI 1: Campaign generator (route: POST /api/ai/generate-campaign)
Input: the owner's rough pitch (business type, city, amount needed, purpose, number of investors, ticket size, return structure).
Output (strict JSON, validated with zod): title, tagline, story, useOfFunds (array of {item, amountInr, percent}), terms (revenue-share %, tenure, payout frequency), faqs (array of {q, a}), offerDocument (a plain-text offer document of about 400 words covering the business, the use of funds, how returns are paid, what happens if the business underperforms or closes, and exit/transfer limits).
Rules: never promise or imply guaranteed returns, use language like "targeted" and "subject to business performance", write in simple English a first-time investor understands. The owner can edit every field before moving on. Show a nice loading state.

### AI 2: Investor Q&A assistant (route: POST /api/ai/investor-qa)
A chat widget on each campaign detail page. Send the campaign's offerDocument plus the user's question to Claude.
Rules in the system prompt: answer ONLY from the offer document. If the answer is not in the document, say "That isn't covered in this offer. Please ask the business owner." Never give personal investment advice such as "you should invest". Keep answers short and in simple language. Reply in the same language the user writes in (Hindi, Marathi, English and so on). Stream the response if easy, otherwise show a typing indicator. Suggested starter questions as clickable chips: "What happens if the cafe closes?", "When do I get my returns?", "Can I withdraw early?".

### AI 3: Compliance and risk check (route: POST /api/ai/compliance-check)
Runs when the owner clicks Publish. Input: the full campaign text.
Checks for: guaranteed or assured returns, "risk-free"/"zero risk" claims, unsupported or exaggerated projections, urgency pressure ("last chance"), and missing disclosures (loss of capital, no insurance, illiquidity, business closure).
Output (strict JSON, zod-validated): passed (boolean), flags (array of {phrase, problem, suggestedRewrite}), missingDisclosures (array of strings), investorRiskSummary (array of 4-6 plain-language bullets).
UI: green "Ready to publish" or red "Needs changes" badge, a table of flagged phrases with a one-click "Apply suggested rewrite" button, and the investorRiskSummary saved to the campaign and shown on the public page in a clearly visible "Risks to know before investing" box. Publish is blocked until passed is true. Add a visible note: "AI screening is a first pass. Human compliance review is required before real launch."

Shared rules for all AI routes: handle malformed JSON by stripping code fences, validating with zod and retrying once; return friendly errors; never log or expose the API key; keep prompts in a single /lib/prompts.ts file so I can tweak them easily.

## Notifications and sessions
- When an investor completes an investment, in one server action: save the investment, update the campaign's raised amount, and insert a row in a notifications table for the owner (for example "Rahul invested ₹10,000 in Brew & Co").
- The owner dashboard subscribes to Supabase Realtime on the notifications table (filtered to their user id) and shows a live toast plus a bell icon with an unread count and a dropdown list. Opening it marks them read. Notifications must also be there when the owner logs in later.
- Optional, only if RESEND_API_KEY is set: also send the owner an email. Skip silently if the key isn't set.
- Sessions: use Supabase Auth with @supabase/ssr and cookie sessions, with automatic token refresh so users stay logged in for a long time (no forced logout during a demo). Protect /dashboard, /invest and /portfolio routes with middleware and redirect to login if there is no session. If a session ever expires, send the user to login and bring them back to the page they were on.

## Seed data
Create a seed script with 3 realistic Pune businesses: a cafe, a bakery and a salon. For each one include a complete offerDocument, use of funds, terms, FAQs, a risk summary, a goal between ₹10 lakh and ₹50 lakh, and some existing investments (for example 40% to 70% funded). Also seed 1 demo owner and 1 demo investor account.

## What to fake (do not build)
Real payments, real KYC, wallets, secondary market. Simulate them with clearly labelled demo screens. Don't build voice input, recommendations or fraud detection. They go on the roadmap slide.

## Quality bar
- Clean, trustworthy look (this is a money product): consistent spacing, good empty/loading/error states, no broken pages.
- Currency formatted in Indian style (₹10,00,000).
- Accessible: labels, contrast, keyboard navigation.
- A README with setup steps, env vars, how to seed, and how to deploy to Vercel.

## Build order
1. Project setup, Supabase schema, auth, deploy a hello-world ✓ (COMPLETE)
2. Seed data, campaign feed and detail pages (NEXT)
3. Invest flow plus notifications (realtime bell)
4. AI 1: campaign generator and create-campaign flow
5. AI 3: compliance check and publish gate
6. AI 2: investor Q&A chat
7. Polish, mobile check, README

After each stage, tell me briefly what works and how to test it. Ask me only if you are truly blocked, otherwise make sensible choices and note them.

## Current Status
- Stage 1 is COMPLETE: Project setup, Supabase schema, auth, landing page, demo login, seed script
- Landing page now fetches and displays featured campaigns from Supabase
- Demo accounts: demo.owner@cafestake.io / Demo1234! and demo.investor@cafestake.io / Demo1234!
- 3 seeded campaigns: Brew & Co (cafe), The Pune Baker (bakery), Glow Studio Salon (salon)
- .env.local is configured with Supabase credentials
- Next stage to build: Stage 2 - Campaign feed and detail pages
