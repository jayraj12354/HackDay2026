# CafeStake Design System (MASTER)

## Philosophy
Premium, hackathon-winning fintech for community investment. Trustworthy, warm, and distinctly local to India without feeling corporate or generic. Dark-first with polished light mode. Focus on clarity, speed, and confidence when dealing with money.

## Color Tokens (CSS Variables)

### Dark Mode (Default)
```css
:root {
  --bg: 222 47% 4%;           /* #020617 - warm near-black */
  --bg-subtle: 215 28% 9%;    /* #0f172a */
  --surface: 215 28% 11%;     /* #111827 */
  --surface-2: 215 28% 14%;   /* #1e293b */
  --border: 215 16% 25%;      /* #334155 / low-contrast borders */
  --border-subtle: 215 16% 19%;
  --text-primary: 210 40% 98%; /* #f8fafc */
  --text-secondary: 215 20% 75%; /* #cbd5e1 */
  --text-tertiary: 215 16% 57%;  /* #94a3b8 */
  --emerald: 158 64% 52%;     /* #10b981 - growth/money */
  --emerald-foreground: 166 91% 9%; /* #022c22 */
  --amber: 38 92% 50%;        /* #f59e0b - warm accent for CTAs */
  --amber-foreground: 26 83% 14%; /* #451a03 */
  --success: 158 64% 52%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;        /* #ef4444 */
  --info: 217 91% 60%;
  --ring: 158 64% 52%;
}
```

### Light Mode
```css
.light {
  --bg: 0 0% 100%;
  --bg-subtle: 210 40% 98%;
  --surface: 0 0% 100%;
  --surface-2: 210 40% 96%;
  --border: 214 32% 91%;
  --border-subtle: 214 32% 95%;
  --text-primary: 222 47% 11%;
  --text-secondary: 215 16% 47%;
  --text-tertiary: 215 16% 57%;
  --emerald: 161 94% 30%;
  --emerald-foreground: 0 0% 100%;
  --amber: 38 92% 50%;
  --amber-foreground: 26 83% 14%;
  --success: 161 94% 30%;
  --warning: 38 92% 50%;
  --danger: 0 72% 51%;
  --info: 221 83% 53%;
  --ring: 161 94% 30%;
}
```

## Typography
- Display: `Satoshi` / `Clash Display` style - bold, distinctive (use `Clash Display` via Google Fonts)
- Body: `Inter` - clean, highly legible
- Mono/Numbers: use `tabular-nums` for all monetary values. Consider `JetBrains Mono` for code/data if needed.

Font loading via next/font:
```ts
import { Inter, Clash_Display } from 'next/font/google'
```

## Spacing Scale (4pt base)
xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, 3xl: 32px, 4xl: 40px, 5xl: 48px, 6xl: 64px

## Border Radius
sm: 0.375rem (6px), md: 0.5rem (8px), lg: 0.75rem (12px), xl: 1rem (16px), 2xl: 1.25rem (20px), 3xl: 1.5rem (24px), full: 9999px

## Elevation/Shadows
- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
- glow-amber: 0 0 0 1px rgb(245 158 11 / 0.4), 0 4px 16px -4px rgb(245 158 11 / 0.5)
- glow-emerald: 0 0 0 1px rgb(16 185 129 / 0.4), 0 4px 16px -4px rgb(16 185 129 / 0.5)

## Components Principles
- One primary CTA per screen
- All money values use `tabular-nums` and Indian number formatting (₹X,XX,XXX)
- Use Lucide icons only (no emojis)
- Consistent 1px borders
- Subtle hover states (150-250ms)
- Respect prefers-reduced-motion
