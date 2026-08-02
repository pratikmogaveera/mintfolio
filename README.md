# Mintfolio

Personal mutual fund portfolio tracker with daily NAV computation, push notifications, and portfolio analytics.

## Purpose

Track your mutual fund holdings in one place. The system fetches latest NAV data daily, computes portfolio value, and pushes a morning notification with your P&L summary — no manual checking required.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router, Tailwind 4) |
| Backend | NestJS 11 |
| Database | PostgreSQL (Drizzle ORM) |
| Job Queue | BullMQ + Redis |
| Notifications | Web Push API + Service Worker |
| Monorepo | Turborepo + pnpm workspaces |
| Infra | Vercel (frontend), Railway (backend + PostgreSQL + Redis) |

## How to Run

```bash
pnpm install
pnpm turbo dev
```

- Web: http://localhost:3000
- Server: http://localhost:3001

## File Structure

```
mintfolio/
├── apps/
│   ├── web/                — Next.js frontend (Vercel)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/
│   │   │   │   │   └── [...path]/route.ts — catch-all proxy (forwards all API calls to Railway, relays cookies)
│   │   │   │   ├── (protected)/
│   │   │   │   │   ├── layout.tsx          — route guard (redirects unauthenticated users)
│   │   │   │   │   ├── holdings/page.tsx   — holdings page (add form + list)
│   │   │   │   │   ├── holdings/layout.tsx — holdings page metadata
│   │   │   │   │   ├── portfolio/page.tsx  — portfolio dashboard (chart, summary, holdings)
│   │   │   │   │   ├── portfolio/layout.tsx — portfolio page metadata
│   │   │   │   │   └── profile/page.tsx    — user profile + notification subscription management
│   │   │   │   │   └── profile/layout.tsx  — profile page metadata
│   │   │   │   ├── api/
│   │   │   │   │   └── [...path]/route.ts — catch-all proxy (forwards all API calls to Railway, relays cookies)
│   │   │   │   ├── login/page.tsx      — login page (react-hook-form + zod)
│   │   │   │   ├── sign-up/page.tsx    — sign-up page
│   │   │   │   ├── page.tsx            — homepage (SW registration)
│   │   │   │   └── layout.tsx          — root layout (fonts, metadata, MainProvider)
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── button.tsx          — button variants
│   │   │   │   │   ├── card.tsx            — card primitives
│   │   │   │   │   ├── chart.tsx           — recharts ChartContainer wrapper
│   │   │   │   │   ├── combobox.tsx        — searchable combobox (scheme search)
│   │   │   │   │   ├── dialog.tsx          — modal dialog
│   │   │   │   │   ├── dropdown-menu.tsx   — dropdown menu
│   │   │   │   │   ├── field.tsx           — form field + label wrapper
│   │   │   │   │   ├── input.tsx           — input primitive
│   │   │   │   │   ├── input-group.tsx     — input with inline addons
│   │   │   │   │   ├── item.tsx            — list item (title, description, actions)
│   │   │   │   │   ├── label.tsx           — label primitive
│   │   │   │   │   ├── popover.tsx         — click-triggered popover
│   │   │   │   │   ├── separator.tsx       — separator
│   │   │   │   │   ├── sheet.tsx           — side drawer (mobile nav)
│   │   │   │   │   ├── skeleton.tsx        — loading skeleton
│   │   │   │   │   ├── sonner.tsx          — toast notifications
│   │   │   │   │   ├── switch.tsx          — toggle switch
│   │   │   │   │   └── textarea.tsx        — textarea primitive
│   │   │   │   ├── AddHoldingForm.tsx      — scheme search combobox + create holding form
│   │   │   │   ├── ConfirmationDialog.tsx  — imperative confirm dialog (promise-based)
│   │   │   │   ├── Footer.tsx              — footer with contact popover
│   │   │   │   ├── Header.tsx              — auth-aware header with mobile sheet nav
│   │   │   │   ├── HoldingSparkline.tsx    — per-holding 7-day NAV sparkline chart
│   │   │   │   ├── HoldingsList.tsx        — holdings list with update/delete actions
│   │   │   │   ├── HoldingsSummary.tsx     — portfolio summary stat cards
│   │   │   │   ├── NotificationPrompt.tsx  — onboarding modal/sheet for enabling push notifications
│   │   │   │   └── UpdateHoldingDialog.tsx — update holding form dialog
│   │   │   └── lib/
│   │   │       ├── hooks/
│   │   │       │   ├── route-guard.tsx     — client-side auth redirect hook
│   │   │       │   ├── use-auth.ts         — current user query hook
│   │   │       │   ├── use-debounce.ts     — debounce hook
│   │   │       │   └── use-notification.ts — push notification status + subscribe/toggle logic
│   │   │       ├── api-client.ts       — axios instance + grouped API functions
│   │   │       ├── schema.ts           — Zod schemas + payload types
│   │   │       ├── utils.ts            — shared constants + helpers (formatINR, cn, maskValue)
│   │   │       ├── PrivacyContext.tsx  — privacy mode context + usePrivacy hook
│   │   │       └── MainProvider.tsx    — react-query + theme + privacy + confirmation dialog provider
│   │   └── public/
│   │       └── sw.js               — service worker (push notifications)
│   └── server/             — NestJS backend (Oracle Cloud)
│       ├── src/
│       │   ├── auth/
│       │   │   ├── auth.module.ts      — auth module wiring (JwtModule async config)
│       │   │   ├── auth.controller.ts  — register/login/me endpoints
│       │   │   ├── auth.service.ts     — auth business logic (hash, verify, JWT)
│       │   │   ├── auth.guard.ts       — JWT Bearer token guard
│       │   │   └── auth.dto.ts         — request validation DTOs
│       │   ├── portfolio/
│       │   │   ├── portfolio.module.ts     — portfolio module wiring
│       │   │   ├── portfolio.controller.ts — holdings CRUD + logs + NAV history endpoints
│       │   │   ├── portfolio.service.ts    — holdings business logic
│       │   │   └── portfolio.dto.ts        — holdings validation DTOs
│       │   ├── common/
│       │   │   ├── http-exception.filter.ts — global exception formatter
│       │   │   └── response.interceptor.ts  — success response wrapper
│       │   ├── redis/
│       │   │   ├── redis.module.ts         — Redis module
│       │   │   └── redis.service.ts        — ioredis wrapper + scheme cache population
│       │   ├── scheme/
│       │   │   ├── scheme.module.ts        — scheme module
│       │   │   ├── scheme.controller.ts    — scheme search endpoint
│       │   │   └── scheme.service.ts       — search logic (queries Redis cache)
│       │   ├── jobs/
│       │   │   ├── jobs.module.ts          — jobs module (schedule registration)
│       │   │   ├── jobs.service.ts         — cron scheduler (daily portfolio process)
│       │   │   └── portfolio.processor.ts  — NAV fetch, compute, write to portfolio_logs
│       │   ├── notifications/
│       │   │   ├── notifications.module.ts     — notifications module wiring
│       │   │   ├── notifications.controller.ts — subscribe/status/toggle endpoints
│       │   │   ├── notifications.service.ts    — push subscription storage + delivery
│       │   │   └── notifications.dto.ts        — subscription validation DTOs
│       │   ├── db/
│       │   │   ├── schema.ts           — Drizzle table definitions
│       │   │   ├── migrate.ts          — programmatic migration runner
│       │   │   ├── database.module.ts  — database module
│       │   │   └── database.service.ts — Drizzle instance provider
│       │   ├── types/
│       │   │   └── types.d.ts          — global types (JwtSign, Express augmentation)
│       │   ├── app.module.ts           — root module (ConfigModule, imports)
│       │   └── main.ts                 — bootstrap + global pipes
│       ├── lib/
│       │   └── utils.ts            — shared utilities (bcrypt hash/compare, formatINR)
│       ├── drizzle/            — generated SQL migration files
│       ├── .env                — environment variables (not committed)
│       └── drizzle.config.ts   — Drizzle Kit config
├── packages/
│   └── shared/             — shared types (Holding, PortfolioLog, User, MFScheme, ApiResponse)
├── .kiro/
│   └── steering/           — AI agent config (decisions, design system, nextjs rules)
├── docker-compose.yml      — local dev containers (Postgres, Redis)
├── turbo.json              — Turborepo task config
├── pnpm-workspace.yaml     — workspace definition
├── .prettierrc             — formatter config (tailwindcss plugin)
├── PLAN.md                 — implementation roadmap
├── LEARNINGS.md            — code review learnings and patterns
└── README.md               — this file
```

## Progress

- [x] Monorepo setup (Turborepo, pnpm workspaces)
- [x] Scaffold Next.js + NestJS + shared package
- [x] Turbo dev running both apps
- [x] Docker Compose — Postgres + Redis (local dev)
- [x] Drizzle ORM — schema + migrations
- [x] NestJS API — auth (register, login, JWT guard, /me)
- [x] NestJS API — portfolio CRUD (holdings: create, read, update, delete)
- [x] NestJS API — scheme search (proxy to mfapi.in)
- [x] Cron job — NAV fetch, portfolio compute, write to portfolio_logs
- [x] Web Push — server sends, frontend SW receives
- [x] Frontend — login page, sign-up page, react-query, apiClient
- [x] Shared types package (@mintfolio/shared)
- [x] httpOnly cookie auth (secure, sameSite, logout endpoint)
- [x] Frontend — holdings page (add/view/edit/delete holdings, scheme search)
- [x] Frontend — portfolio dashboard (chart, summary cards, holdings list)
- [x] Frontend — per-holding sparkline charts (7-day NAV history)
- [x] Frontend — view transitions between portfolio and holdings pages
- [x] Frontend — mobile nav (sheet), footer, header polish
- [x] NestJS API — portfolio logs endpoint
- [x] Backend deployed to Railway (PostgreSQL + Redis + NestJS)
- [x] Frontend deployed to Vercel
- [x] Next.js API proxy (forwards all calls to Railway, fixes cross-domain cookie on mobile)
- [x] Privacy mode (mask monetary values + scheme names, persisted to localStorage)
- [x] Frontend — push notification subscription management (profile page: subscribe, toggle, denied state, onboarding prompt)
- [ ] Production validation (2–3 days)

## Resources

- [MFAPI](https://www.mfapi.in) — free mutual fund NAV data (no auth)
- [Turborepo docs](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Web Push Protocol](https://web.dev/articles/push-notifications-overview)
