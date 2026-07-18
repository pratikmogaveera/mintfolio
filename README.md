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
| Infra | Vercel (frontend), Oracle Cloud Free Tier (backend) |

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
│   │   │   │   ├── login/page.tsx      — login page (react-hook-form + zod)
│   │   │   │   ├── sign-up/page.tsx    — sign-up page
│   │   │   │   ├── page.tsx            — homepage (SW registration + push subscribe)
│   │   │   │   └── layout.tsx          — root layout (fonts, metadata, QCProvider)
│   │   │   └── lib/
│   │   │       ├── api-client.ts       — axios instance with auth interceptor
│   │   │       └── QCProvider.tsx      — react-query provider
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
│       │   │   ├── portfolio.controller.ts — holdings CRUD endpoints
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
│       │   └── utils.ts            — shared utilities (bcrypt hash/compare)
│       ├── drizzle/            — generated SQL migration files
│       ├── .env                — environment variables (not committed)
│       └── drizzle.config.ts   — Drizzle Kit config
├── packages/
│   └── shared/             — shared types, schemas, constants
├── .kiro/
│   └── steering/           — AI agent config (decisions, design system, nextjs rules)
├── docker-compose.yml      — local dev containers (Postgres, Redis)
├── turbo.json              — Turborepo task config
├── pnpm-workspace.yaml     — workspace definition
├── .prettierrc             — formatter config (tailwindcss plugin)
├── PLAN.md                 — implementation roadmap
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
- [ ] Test end-to-end locally
- [ ] Deploy to Vercel + Oracle Cloud
- [ ] Production validation (2–3 days)

## Resources

- [MFAPI](https://www.mfapi.in) — free mutual fund NAV data (no auth)
- [Turborepo docs](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Web Push Protocol](https://web.dev/articles/push-notifications-overview)
