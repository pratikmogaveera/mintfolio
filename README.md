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
│   └── server/             — NestJS backend (Oracle Cloud)
│       ├── src/db/
│       │   ├── schema.ts       — Drizzle table definitions
│       │   └── migrate.ts      — programmatic migration runner
│       ├── drizzle/            — generated SQL migration files
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
- [ ] NestJS API — auth, portfolio CRUD, scheme search
- [ ] BullMQ — cron job, NAV fetch, portfolio compute
- [ ] Web Push — server sends, frontend SW receives
- [ ] Test end-to-end locally
- [ ] Deploy to Vercel + Oracle Cloud
- [ ] Production validation (2–3 days)

## Resources

- [MFAPI](https://www.mfapi.in) — free mutual fund NAV data (no auth)
- [Turborepo docs](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Web Push Protocol](https://web.dev/articles/push-notifications-overview)
