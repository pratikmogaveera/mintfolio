# Next.js — Agent Rules

This project uses Next.js 16, which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data.

**Before writing any Next.js code:** Read the relevant guide in `apps/web/node_modules/next/dist/docs/` and heed deprecation notices.

## Verification

Use `pnpm tsc --noEmit` (from `apps/web/`) to type-check instead of running a full build. It's faster — skips bundling, page generation, and static rendering.
