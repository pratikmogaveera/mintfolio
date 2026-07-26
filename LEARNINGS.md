# Mintfolio — Code Review Learnings

Patterns, conventions, and mistakes caught during code reviews. Reference this before submitting code.

---

## TypeScript / General

| # | Learning | Context |
|---|----------|---------|
| 1 | `JSON.stringify` strips keys with `undefined` values. Use `?? null` if you want the key to always appear. | Response interceptor returning `data: undefined` |
| 2 | `JSON.parse()` returns `any` — cast with `as Type` to satisfy eslint strict rules. | Parsing cached Redis data |
| 3 | Arrow function in `setTimeout` must **call** the resolve: `setTimeout(() => r(), 5000)` not `setTimeout(() => r, 5000)`. | Testing delay in auth service |
| 4 | `@Matches` in class-validator uses `RegExp.test()` — it checks if pattern exists **anywhere**. Use anchors `^...$` for full-string validation. | Username validation DTO |
| 5 | CommonJS packages under `"moduleResolution": "nodenext"` — use named imports (`import { fn } from 'pkg'`) instead of `import * as pkg` or default imports. | `web-push` types not resolving |
| 6 | `new Promise((r) => setTimeout(() => r(), 5000))` needs `new Promise<void>` — TypeScript requires the generic to know `r()` takes no arguments. | Testing delay in auth service |

---

## NestJS Conventions

| # | Learning | Context |
|---|----------|---------|
| 1 | Use standard `async method()` syntax, not arrow functions (`method = async () => {}`). Arrow functions can't have decorators applied to them. | Auth service methods |
| 2 | `@IsNotEmpty()` is for strings/arrays — redundant on `@IsNumber()` fields. | Portfolio DTO |
| 3 | `ConfigModule.forRoot({ isGlobal: true })` — do this once and never import ConfigModule in sub-modules. | JwtModule.registerAsync needing ConfigModule import |
| 4 | `JwtModule.register()` evaluates at import time — `process.env` may be undefined. Use `registerAsync()` with ConfigService for env-dependent config. | JWT_SECRET being undefined |
| 5 | Nest can't resolve dependencies = the provider isn't in the module's `providers` array, or the source module isn't imported. | PortfolioProcessor not found in JobsModule |
| 6 | Logger context should match class name: `new Logger('AuthService')` not `new Logger('Auth')`. | Inconsistent logger names |
| 7 | Cron job names must be unique across all `@Cron` decorators. | Duplicate "Daily portfolio process" names |
| 8 | `@Catch()` (no argument) catches ALL exceptions. `@Catch(HttpException)` only catches HTTP ones — unexpected errors bypass it. | Exception filter not catching DB errors |

---

## Error Handling Patterns

| # | Learning | Context |
|---|----------|---------|
| 1 | **Always re-throw `HttpException` in catch blocks** — otherwise your own try/catch swallows 401s, 404s, 409s and returns 200. Pattern: `if (error instanceof HttpException) throw error;` as first line in catch. | Every service method |
| 2 | Don't return `{ success: false }` from a service when you have an interceptor — it gets wrapped as `{ success: true, data: { success: false } }`. Always throw. | Auth/portfolio services after adding ResponseInterceptor |
| 3 | Don't leak internal error details to client. Log the real error, return generic message: `'Something went wrong.'` | Service catch blocks |
| 4 | Don't return different messages for "user not found" vs "wrong password" — that's an enumeration vulnerability. Use one generic: `'Invalid credentials'`. | Login endpoint |
| 5 | Use `logger.error()` with stack trace for unexpected pipeline failures. Use `logger.warn()` for expected failures (login failed, missing subscription). | Portfolio processor catch block |
| 6 | Handle per-item errors in `Promise.all` — one failure shouldn't kill the entire batch. Wrap individual items in try/catch inside `.map()`. | Push notification sending to multiple subscriptions |

---

## Database / Drizzle

| # | Learning | Context |
|---|----------|---------|
| 1 | `bcrypt.hash()` generates different output each time (random salt). Never compare hashes directly — use `bcrypt.compare(plain, hash)`. | Login always failing |
| 2 | Drizzle's `numeric()` column expects `string` for inserts, not `number`. Call `.toString()` on number values. | Holdings insert type error |
| 3 | Drizzle wraps PG errors in `DrizzleQueryError` — access the original via `error.cause`. Check `error.cause.code === '23505'` for unique violations. | Duplicate holding detection |
| 4 | Use `onConflictDoUpdate` for upserts instead of manual SELECT-then-INSERT (race condition safe). | Portfolio logs daily upsert |
| 5 | Inline objects in Drizzle's `.values()` can trigger TypeScript excess property checking bugs. Extract to a variable to bypass. | Holdings insert cryptic type error |

---

## API Design

| # | Learning | Context |
|---|----------|---------|
| 1 | Use a single `identifier` field for login (accepts email or username). Check for `@` server-side to determine which column to query. | Login DTO design |
| 2 | Don't expose `user_id` in GET responses — the client already knows who they are. Select specific columns. | Holdings GET returning user_id |
| 3 | DELETE returning "not found" should be a `404 NotFoundException`, not `200` with a message. | Holdings delete |
| 4 | Use global interceptor for response wrapping + global filter for error formatting. Don't manually wrap in every service method. | Uniform response shape |
| 5 | Login password validation on backend should NOT enforce min length — it leaks password policy. Just check `@IsNotEmpty()`. Let bcrypt.compare fail naturally. | Login DTO |
| 6 | Email max length per RFC is 254 characters. Don't cap at 40. | Auth DTO validation |

---

## Frontend / React

| # | Learning | Context |
|---|----------|---------|
| 1 | `Notification.requestPermission()` only works in page context — NOT inside a service worker. | Push subscription flow |
| 2 | Zod schema should be **outside** the component — recreating on every render is wasteful. | Login page |
| 3 | `isLoading` in react-hook-form is for async default values. Use **`isSubmitting`** for form submission state. | Login button loading state |
| 4 | Remove `required` HTML attribute when using Zod/react-hook-form — native browser validation conflicts with custom error display. | Login form inputs |
| 5 | `type="identifier"` is not a valid HTML input type. Use `type="text"`. | Login form identifier field |
| 6 | Zod v4 (`3.25.x`) is incompatible with `@hookform/resolvers@5`. Use Zod `3.24.x` + resolvers `3.x`. | zodResolver type error |
| 7 | `redirect()` from `next/navigation` throws internally (for Server Components). Use `router.push()` for client-side navigation. | Login redirect throwing in mutation callback |
| 8 | `QueryClient` should not be recreated on every render — use `useState` or declare outside the component. | QCProvider |
| 9 | `localStorage` doesn't exist on the server. Guard with `typeof window !== 'undefined'` in code that may run during SSR. | apiClient interceptor |
| 10 | `autoComplete="new-password"` for sign-up, `autoComplete="current-password"` for login. Tells password managers the correct action. | Login/sign-up form inputs |
| 11 | react-hook-form `mode: 'onTouched'` — validates after first blur, then reactively on change. Best UX balance. | Login/sign-up forms |

---

## Security

| # | Learning | Context |
|---|----------|---------|
| 1 | Don't commit JWT tokens or hardcode them in source files. Read from localStorage at runtime. | Hardcoded token in page.tsx |
| 2 | CORS `origin` should come from env, not hardcoded. Will break when deploying to production. | `app.enableCors({ origin: 'http://localhost:3000' })` |
| 3 | Always verify resource ownership on mutations — check `user_id` matches the JWT subject. Not just the resource ID (IDOR prevention). | Holdings delete/update |
| 4 | `ConfigService.getOrThrow()` fails fast at startup if env var is missing — better than silent `undefined`. | VAPID keys config |
| 5 | Cookie `sameSite: 'lax'` works for same-site (localhost or same domain). For cross-domain production (e.g., `vercel.app` → `api.yoursite.dev`), need `sameSite: 'none'` + `secure: true`, or use subdomain setup (same eTLD+1). | httpOnly cookie auth |

---

## Git / Workflow

| # | Learning | Context |
|---|----------|---------|
| 1 | Don't commit debug logs (`console.log`) or test delays (`setTimeout 5s`). | Various |
| 2 | Don't commit test cron expressions (`EVERY_MINUTE`) — revert to production schedule before committing. | Jobs service |
| 3 | Magic numbers should be constants: `86400` → `SCHEME_CACHE_TTL`, `20` → `SEARCH_RESULT_LIMIT`. | Redis TTL, search limit |
| 4 | Remove unused imports and dead code (e.g., `MinLength` import after switching to `Length`). | Auth DTO |

---

## Performance

| # | Learning | Context |
|---|----------|---------|
| 1 | Extract invariant computations out of loops: `q.toLowerCase()` called once before `.filter()`, not 50K times inside it. | Scheme search |
| 2 | Deduplicate before fetching: `[...new Set(codes)]` prevents fetching the same NAV twice for different users holding the same scheme. | Portfolio processor |
| 3 | Use `Promise.all` for independent async operations (parallel NAV fetches). Sequential `await` in a loop is unnecessarily slow. | NAV fetch for 10 schemes |
| 4 | Skip cache population if cache already exists (check before fetching). Saves a 5MB API call on every restart. | Redis scheme list on startup |

---

## Frontend / React (continued)

| # | Learning | Context |
|---|----------|---------|
| 12 | `viewTransitionName` must be unique per page. Assigning it to a repeated element (e.g., each holding card) breaks the transition — only use it on unique containers. | View transitions between portfolio and holdings |
| 13 | `grid` without explicit column count stretches items to full width. Use `flex flex-col` for content-sized stacking, `grid` only when you need equal column widths. | Dialog content full-width bug |
| 14 | `min-w-0` on flex/grid children is required for `truncate` to work — without it, content dictates the element's minimum width and overflow never kicks in. | Holdings list item truncation |
| 15 | Phantom dependencies (packages available via hoisting but not declared) work locally but break on deployment. Always declare dependencies explicitly in the package's own `package.json`. | `dayjs` used in web without being declared |
| 16 | `--container-sm: 100%` in Tailwind v4 bleeds into `max-w-sm` — `sm` is a shared size token. Don't declare `--container-sm` if you need `max-w-sm` to work correctly. | Dialog width bug |
| 17 | Base UI `HoverCard` (PreviewCard) is hover-only — it doesn't fire on touch. Use `Popover` for contact/info cards that need to work on mobile too. | Footer contact card |
| 18 | `setState({ open: true, ...options })` replaces entire state — fields not in `options` revert to their type defaults (`undefined`), not the `useState` initial values. Use functional update `setState(prev => ({ ...prev, ...options }))` to preserve defaults. | ConfirmationDialog cancelLabel going blank |

---

## Drizzle (continued)

| # | Learning | Context |
|---|----------|---------|
| 5 | TypeScript doesn't narrow `string | undefined` through `if (!x) throw` when the throw is outside a `try` block in some cases. Use explicit type assertions or move the guard before all usage. | `getPortfolioLogs` Drizzle eq() type error |

---

## API Design (continued)

| # | Learning | Context |
|---|----------|---------|
| 7 | Separate "data" endpoints from "enrichment" endpoints. `GET /holdings` returns core holding data immediately; `GET /nav-history` fetches enrichment data independently — keeps the list fast and lets the chart load async. | Per-holding sparkline architecture |
