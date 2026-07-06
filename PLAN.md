# Mintfolio — Plan

## Goal

Full-stack portfolio tracking system — users add their mutual fund holdings, system computes daily portfolio value via scheduled BullMQ jobs, and pushes morning notifications with P&L summary.

---

## Phase 1 Checklist

- [x] Git repo + .gitignore
- [x] Turborepo monorepo structure (pnpm workspace, turbo.json)
- [x] Project docs committed (PLAN.md, .kiro/steering)
- [ ] Scaffold Next.js in apps/web
- [ ] Scaffold NestJS in apps/server
- [ ] Create packages/shared
- [ ] Install Turborepo as dev dependency
- [ ] Verify turbo dev runs both apps
- [ ] Set up PostgreSQL + Redis containers (Oracle Cloud)
- [ ] Set up Drizzle ORM + schema
- [ ] BullMQ cron job (daily 6 AM)
- [ ] Web Push notification (server-triggered)
- [ ] Service Worker on frontend
- [ ] Deploy Next.js to Vercel
- [ ] Deploy backend to Oracle Cloud
- [ ] Test for 2–3 days

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (Vercel) |
| Backend | NestJS + @nestjs/bullmq |
| Database | PostgreSQL (Drizzle ORM) |
| Job Queue | BullMQ + Redis |
| Notifications | Web Push API + Service Worker |
| Infra | Oracle Cloud Free Tier (Redis, NestJS, PostgreSQL containers) |

## Architecture

```
Next.js (Vercel)
├── Portfolio UI (add/remove funds, view current value)
├── Service Worker (push notification receiver)
└── Push subscription management

NestJS (Oracle Cloud)
├── Auth (username + password, JWT)
├── REST API (portfolio CRUD, scheme search)
├── BullMQ scheduler (daily 6 AM cron)
│     → Fan-out: fetch NAV for all users' holdings
│     → Aggregate: compute portfolio value per user
│     → Write daily valuation to PostgreSQL
│     → Push notification to all user's subscribed devices
└── Web Push endpoint (store/manage subscriptions)

PostgreSQL
├── users table
├── holdings table
├── portfolio_logs table (daily valuation per user)
└── push_subscriptions table (per device per user)

Redis
└── BullMQ job state, schedules, queues
```

## Phases

### Phase 1 — Single-User Pipeline (Prove it works)

**Goal:** End-to-end pipeline running for 1 user (yourself) with static preset data.

- Redis + NestJS + PostgreSQL containers on Oracle Cloud
- Next.js deployed on Vercel
- BullMQ cron job at 6:00 AM IST:
  - Fetch NAV for preset scheme codes + units
  - Compute portfolio value
  - Write result to PostgreSQL
  - Push notification with daily summary
- Service Worker on frontend receives and displays notification
- Test for 2–3 days to validate reliability

**Done when:** You wake up and get a push notification with your portfolio value every morning.

### Phase 2 — Multi-User System

**Goal:** Full-stack app with auth, dynamic portfolios, and per-user notifications.

**Frontend:**
- Login (username + password)
- Scheme search (via mfapi.in/mf/search endpoint)
- Add schemes with units to portfolio
- View portfolio with current value, daily P&L
- Request notification permission, manage subscriptions

**Backend (NestJS):**
- Auth: register/login, bcrypt + JWT
- Portfolio CRUD: store user's holdings (scheme code, units, amount invested)
- Push subscription storage (multiple devices per user)
- Daily BullMQ job:
  - Fetch all users' holdings
  - Fan-out NAV fetches per scheme (deduplicated across users)
  - Compute per-user portfolio value
  - Write daily log to portfolio table
  - Push notification to each user's subscribed devices

**Database schema:**
- `users` — id, username, password_hash
- `holdings` — id, user_id, scheme_code, scheme_name, units, amount_invested
- `portfolio_logs` — id, user_id, date, total_invested, current_value
- `push_subscriptions` — id, user_id, endpoint, keys_p256dh, keys_auth, device_label

### Phase 3 — Polish & Analytics (Optional)

- Portfolio growth chart (time-series from daily logs)
- Threshold alerts (notify if portfolio drops > X%)
- Offline portfolio view (Workbox runtime caching)
- Install prompt (PWA manifest, mobile installable)
- Graceful SW update flow (show "update available" toast)

## Data Source

- [MFAPI](https://www.mfapi.in) — free, no auth
  - `/mf/{code}/latest` — latest NAV for a scheme
  - `/mf/search?q={query}` — search schemes by name

## Success Criteria

- Daily push notification arrives by 6:15 AM with portfolio summary
- Portfolio value updates daily without manual intervention
- Multiple devices receive notifications for the same user
- System recovers from API failures via retries
- Daily logs enable portfolio growth tracking over time

## Not In Scope

- Real-time NAV streaming
- SIP automation / transaction execution
- Charts in Phase 1–2 (deferred to Phase 3)
- OAuth / social login (simple username + password is fine)

---

## Log

| Date | What was done |
|------|---------------|
| 2026-07-06 | Project created — GitHub repo (private), .gitignore, Turborepo monorepo structure, PLAN.md, steering docs (decisions, design system) |
