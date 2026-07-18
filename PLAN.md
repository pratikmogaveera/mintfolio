# Mintfolio — Plan

## Goal

Full-stack portfolio tracking system — users add their mutual fund holdings, system computes daily portfolio value via scheduled BullMQ jobs, and pushes morning notifications with P&L summary.

---

## Phase 1 Checklist

- [x] Git repo + .gitignore
- [x] Turborepo monorepo structure (pnpm workspace, turbo.json)
- [x] Project docs committed (PLAN.md, .kiro/steering)
- [x] Scaffold Next.js in apps/web
- [x] Scaffold NestJS in apps/server
- [x] Create packages/shared
- [x] Install Turborepo as dev dependency
- [x] Verify turbo dev runs both apps
- [x] Docker Compose — Postgres + Redis (local dev)
- [x] Drizzle ORM — schema + migrations
- [x] NestJS API — auth (register, login, JWT guard, /me)
- [x] NestJS API — portfolio CRUD (holdings: create, read, update, delete)
- [x] NestJS API — scheme search (proxy to mfapi.in)
- [x] Uniform response shape — global exception filter + response interceptor
- [x] Cron job — NAV fetch, portfolio compute, write to portfolio_logs
- [x] Web Push — server sends, frontend SW receives
- [x] Frontend — login page, sign-up page, react-query, apiClient
- [x] Shared types package (@mintfolio/shared)
- [ ] Test end-to-end locally
- [ ] Deploy Next.js to Vercel
- [ ] Deploy backend to Oracle Cloud (containerize)
- [ ] Test for 2–3 days (production)

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

## API Response Shape

All endpoints return a uniform envelope:

```json
// Success with data
{ "success": true, "data": <payload> }

// Success without data
{ "success": true, "message": "Holding deleted successfully." }

// Error
{ "success": false, "message": "User-friendly error description." }
```

- Every response has `success: boolean`
- `data` holds the payload (object or array) on success
- `message` provides context (error reason, or confirmation on mutations without data)
- HTTP status codes still used correctly (200, 201, 400, 401, 404, 409, 500)
- NestJS HttpExceptions should be intercepted to match this shape (use a global response interceptor + exception filter)

## Phases

### Phase 1 — Backend Pipeline (Prove it works)

**Goal:** End-to-end backend running for 1 user (yourself) — daily portfolio computation + push notification.

**Completed:**
1. Docker Compose — Postgres + Redis containers for local development
2. Drizzle ORM — schema + migrations
3. NestJS API — auth (register, login, JWT guard, /me)
4. NestJS API — portfolio CRUD (holdings: create, read, update, delete)
5. NestJS API — scheme search (Redis-cached, filtered)
6. Global exception filter + response interceptor (uniform API shape)
7. Cron job — NAV fetch (parallel, deduplicated, cached), portfolio compute, upsert to portfolio_logs

**Remaining:**
1. Web Push — server sends notification after portfolio compute
2. Minimal frontend page with service worker to receive push
3. Deploy to Vercel (frontend) + Oracle Cloud (backend)
4. Test for 2–3 days (production validation)

**Pipeline:**
- Cron at 6:00 AM IST:
  - Fetch latest NAV for all unique scheme codes (deduplicated across users)
  - Compute per-user portfolio value (units × NAV)
  - Upsert daily snapshot to portfolio_logs
  - Push notification with daily summary

**Done when:** You wake up and get a push notification with your portfolio value every morning.

### Phase 2 — Full-Stack App

**Goal:** Complete frontend + backend polish for multi-user usage.

**Frontend (Next.js):**
- Login / register UI
- Scheme search (autocomplete from backend)
- Add/remove schemes with units to portfolio
- Portfolio dashboard — current value, daily P&L, holdings list
- Notification permission + subscription management

**Backend:**
- Migrate from @nestjs/schedule to BullMQ (queues, retries, job visibility, Bull Board)
- Push subscription storage (multiple devices per user)
- Push notification delivery per user after portfolio compute

### Phase 3 — Polish & Analytics (Optional)

- Portfolio growth chart (time-series from daily logs)
- Threshold alerts (notify if portfolio drops > X%)
- Offline portfolio view (Workbox runtime caching)
- Install prompt (PWA manifest, mobile installable)
- Graceful SW update flow (show "update available" toast)
- SEO: robots.txt, sitemap, Twitter card meta, OG image, OG url, structured data

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
| 2026-07-07 | Scaffolded Next.js 16, NestJS 11, packages/shared. Turbo dev verified. Prettier + Tailwind plugin configured. Local-first dev order decided. Docker Compose with Postgres 18 + Redis 8 running locally. |
| 2026-07-08 | Drizzle ORM setup — installed drizzle-orm, pg, drizzle-kit. Created `users` table schema. Generated first migration. Programmatic migrate script (drizzle-kit migrate has a silent crash bug). `users` table live in local Postgres. |
| 2026-07-09 | Auth register endpoint — DatabaseModule + DatabaseService (Drizzle provider), ConfigModule for env loading, AuthModule with controller/service/DTO. Bcrypt password hashing, duplicate email/username check with ConflictException, ValidationPipe for request validation. Register tested and working. |
| 2026-07-10 | Auth login endpoint — single identifier field (email or username), bcrypt compare, returns JWT. Extracted hash/compare into lib/utils. |
| 2026-07-11 | JWT signing (JwtModule.registerAsync + ConfigService), AuthGuard (Bearer token verification, attaches user to request), GET /auth/me endpoint (returns user from DB). Loggers added to guard and service. Auth module complete. Portfolio CRUD — PortfolioModule with controller/service/DTO. GET/POST/DELETE holdings endpoints, scoped to authenticated user. IDOR protection on delete, NotFoundException for missing holdings. Renamed usersTable → users in schema. |
| 2026-07-12 | PATCH holdings endpoint (update units/amount_invested). @Min validation, Postgres 23505 unique violation handling via DrizzleQueryError.cause. Global HttpExceptionFilter (@Catch() for all exceptions — HttpException formatted, unknown returns generic 500). ResponseInterceptor wraps all success in { success, data }. Stripped manual wrappers from services. Polished DTO validation messages. Consistent error handling: re-throw HttpExceptions, log + throw unexpected errors. |
| 2026-07-13 | Scheme search — RedisModule (ioredis, ConfigService for URL), cache scheme list from mfapi on startup with 24h TTL. SchemeModule with GET /scheme/search?q= endpoint, filters cached list, returns top 20 matches. Made ConfigModule global. Response interceptor returns data: null for undefined payloads. |
| 2026-07-14 | Daily portfolio pipeline — JobsModule with @nestjs/schedule cron. PortfolioProcessor fetches NAV per unique scheme (parallel, cached 5min), computes per-user portfolio value, upserts to portfolio_logs (handles duplicate daily runs). Improved logs and exception messages across all services. Standardized logger context names. |
| 2026-07-15 | Web Push notifications — NotificationsModule with subscribe/unsubscribe endpoints, VAPID config, web-push integration. Portfolio processor sends push after compute (▲/▼ indicator, INR formatting, P&L %). Auto-remove expired subscriptions (410/404). Production cron schedule (6 AM IST) + daily scheme refresh (5 AM). |
| 2026-07-16 | Frontend service worker — sw.js with push event listener, SW registration on homepage, push subscription flow. Minimal login (localStorage token). End-to-end push notification tested successfully on macOS (Safari + Chrome). CORS enabled on server. |
| 2026-07-18 | Frontend auth pages — login page with react-hook-form + zod + react-query (useMutation, isPending, toast notifications, redirect). Sign-up page with same pattern. Created apiClient (axios instance + auth interceptor). QCProvider for react-query. Shared types package (@mintfolio/shared) — User, AuthResponse, Holding, PortfolioLog, MFScheme, ApiResponse, ApiError. Integrated in both apps. |
