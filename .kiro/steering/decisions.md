# Mintfolio — Decisions Log

## Project Overview

Full-stack mutual fund portfolio tracker with daily NAV computation, push notifications, and portfolio analytics. Design doc: `./PLAN.md`

---

## Decision 1: Monorepo with Turborepo

**Date:** 2026-07-05
**Choice:** Monorepo (Turborepo + pnpm workspaces)
**Alternatives considered:** Separate repos for frontend and backend

**Reasons:**
- Shared types, Zod schemas, and constants between Next.js and NestJS — single source of truth
- One PR can touch both frontend and backend (e.g., new API endpoint + UI)
- Vercel supports monorepos natively (point to `apps/web`)
- Oracle Cloud pulls full repo but only builds `apps/server`
- Production-level skill worth having on resume
- Turborepo is lightweight (just `turbo.json`), built by Vercel — seamless integration

**Structure:**
```
mintfolio/
├── apps/
│   ├── web/          — Next.js (Vercel)
│   └── server/       — NestJS (Oracle Cloud)
├── packages/
│   └── shared/       — types, schemas, constants
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Decision 2: pnpm as Package Manager

**Date:** 2026-07-05
**Choice:** pnpm
**Alternatives considered:** npm (familiar), yarn

**Reasons:**
- Required/recommended for Turborepo workspaces
- Faster installs, strict dependency resolution (catches phantom deps)
- Industry standard for modern monorepos
- Minimal learning curve from npm (`pnpm install`, `pnpm dlx`)

---

## Decision 3: Deployment Strategy

**Date:** 2026-07-05
**Choice:** Next.js on Vercel, NestJS + Redis + PostgreSQL on Oracle Cloud Free Tier

**Reasons:**
- Vercel has native Turborepo/Next.js support, zero-config deployment
- Oracle Cloud free tier provides always-free ARM instances for backend containers
- Keeps costs at $0 for a personal/portfolio project
- Clean separation: static/SSR frontend on edge, backend services on VPS

---

## Decision 4: Theming & Visual Direction

**Date:** 2026-07-05
**Choice:** Mint + Warm Signal — Hybrid (Apple × Clay) variant

**Theme summary:**
- Dark mode primary, light mode available
- Fun, tasteful, clean — NOT minimal black & white, NOT brutalist
- Green (`#4ade80` dark / `#16a34a` light) as single accent for gains + actions
- Orange (`#fb923c` dark / `#ea580c` light) as warm signal ONLY for losses/alerts — never decorative
- Inspired by Apple (disciplined single-accent, tight typography) + Clay (generous borderless surfaces, rounded cards)

**Dark mode palette:**
- BG: `#09090b`
- Surface: `#111114`
- Elevated: `#18181b`
- Accent: `#4ade80`
- Warm signal: `#fb923c`
- Text: `#fafafa`
- Muted: `#52525b` / `#71717a`

**Light mode palette:**
- BG: `#fafafa`
- Surface/Cards: `#ffffff` with `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`
- Accent: `#16a34a`
- Warm signal: `#ea580c`
- Text: `#111827`
- Muted: `#6b7280` / `#9ca3af`

**Structural traits (Hybrid C):**
- Border radius: 14px for cards, 10px for buttons
- Borderless cards — elevation via surface color + subtle shadow (light mode)
- Thin nav divider in dark mode
- Green dot brand mark (● portfolio)
- Green text for ghost/tertiary actions
- Warm-tinted notification in dark mode

**Design references:** Apple design system (spacing, single-accent, typography discipline), Clay design system (borderless cards, generous radius, playful warmth)

---

## Decision 6: Typography

**Date:** 2026-07-05
**Choice:** Space Grotesk + Inter + JetBrains Mono + Playfair Display Italic (greeting only)

**Font roles:**
- **Display** (Space Grotesk 600–700): Portfolio value, section headings, nav brand, change badges, stat values. Geometric, tight tracking, numbers look crisp at large sizes.
- **Body / UI** (Inter 400–600): Fund names, meta text, nav links, buttons, labels, paragraphs. Neutral, readable at small sizes, handles long fund names well.
- **Mono** (JetBrains Mono 400–500): P&L values, individual holding values, percentages. Fixed-width for number alignment in lists.
- **Greeting** (Playfair Display Italic): Only for the "Good morning, Pratik" greeting line. Editorial serif in italic = warm, personal, human touch against the technical data. One playful moment.

**Reasons:**
- Space Grotesk has more character than Inter at display sizes — geometric with distinctive number shapes
- Inter is the industry standard for UI body text
- JetBrains Mono ensures numbers align vertically in holdings lists
- Playfair Italic adds a warm editorial contrast for the single greeting line — genre shift (serif vs sans) signals "this is personal, not data"
- Considered and rejected: script fonts (Lobster, Caveat, etc.) — too decorative/themed; rounded sans fonts (Kodchasan, Nunito, etc.) — didn't feel different enough from the rest of the UI

---

## Decision 7: Accent Color

**Date:** 2026-07-05
**Choice:** Pure Mint — solid `#4ade80`

**Alternatives considered:** Light Mint (#86efac), Mid Mint (#5ee898), various gradients (mint→cyan, mint→emerald, mint→teal, mint→lime)

**Reasons:**
- `#4ade80` has the right saturation — vivid enough to pop on dark backgrounds, not so bright it's fatiguing
- Solid color over gradients — cleaner, more disciplined, matches Apple single-accent philosophy
- Lighter mints (#86efac) looked washed out / less intentional on mobile
- Gradients added visual complexity without adding meaning

---

## Decision 5: Project Name

**Date:** 2026-07-05
**Choice:** Mintfolio
**Shortlist generated:** Growfolio, Stacko, Sipsworth, Fundoo, Paisa Pulse, Foliooo, NAVi, Cheddar, Kompound, Stackfolio, Moola, PortPulse, Fundlytics

**Reasons:**
- Directly references the brand color (mint) + purpose (portfolio)
- Memorable, easy to spell, unique
- Works as a product name — sounds like something you'd install
- The green dot logo (● mintfolio) reads naturally

---

## Pending Decisions

- [ ] Next.js version (likely v16 with App Router)
- [ ] shadcn/ui for component library (likely yes)
- [ ] Auth strategy details (JWT structure, refresh tokens?)
