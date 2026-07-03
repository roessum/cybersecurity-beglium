# MaybeMalware Quiz

A Kahoot-style live quiz platform for cybersecurity awareness workshops and
events. Players join from their phones with a nickname + emoji, a host drives
the game from a big-screen presentation view, questions are timed, scoring
rewards speed and correctness, and a live leaderboard/podium closes each game.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Prisma 7 + PostgreSQL · SSE for realtime · Vercel + Neon for hosting.

## Local development

```bash
npm install
npm run db:up        # start local Postgres in Docker
npm run db:migrate   # apply migrations
npm run db:seed      # load the department sessions (Cleaning … Red Team)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Go to `/host` to open a
game, then join from another tab/phone at `/join` with the PIN.

## How realtime works

There is no websocket server. Postgres is the single source of truth: every
game mutation bumps a `stateVersion` column, and each client holds an SSE stream
(`/api/games/[pin]/stream`) that polls that version server-side and pushes a
fresh snapshot when it changes. `EventSource` reconnects automatically, so this
works on Vercel's serverless model without sticky connections.

## Deploying to Vercel + Neon

1. **Add the Neon integration** to your Vercel project (Storage → Neon). It
   auto-injects the env vars for Production/Preview, including:
   - `DATABASE_URL` — the **pooled** string (`*-pooler.neon.tech`). The app reads
     this and, seeing a Neon host, uses the Neon serverless driver.
   - `POSTGRES_URL_NON_POOLING` — the **direct/unpooled** string, used for
     migrations. `prisma.config.ts` picks it up automatically.

   No manual variables are required. (For local dev without the integration,
   set `DATABASE_URL` / `DIRECT_URL` yourself — see [`.env.example`](.env.example).)
2. **Deploy.** Everything runs in the build — no manual DB steps:
   ```
   build = prisma migrate deploy && tsx prisma/seed.ts && next build
   ```
   So each deploy applies pending migrations and seeds the department sessions on
   Neon, then builds. The seed is idempotent and non-destructive (upserts by
   department, leaves live games/players alone), so re-running on every deploy is
   safe. Migrations and seed use `POSTGRES_URL_NON_POOLING`; the app runtime uses
   the pooled `DATABASE_URL`. `prisma generate` runs via `postinstall`.

   To change the sessions, edit [`prisma/seed.ts`](prisma/seed.ts) and redeploy.

### Scale notes

Each connected client (host + every player) polls Postgres roughly twice a
second via its SSE stream. For a typical session (≈40 players for ~10 minutes)
that's light, steady load Neon handles comfortably — but note Neon compute won't
scale to zero while a game is live. If you ever need to trim load, raise the
poll interval in [`lib/sse.ts`](lib/sse.ts) (`pollMs`, default 600ms).
