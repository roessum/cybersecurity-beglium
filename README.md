# CyberQuiz

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
npm run db:seed      # load the sample cybersecurity quiz
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

1. **Create a Neon project** and grab two connection strings from the dashboard:
   - the **pooled** one (host contains `-pooler`) → for the app runtime
   - the **direct** one (same host without `-pooler`) → for migrations
2. **Set env vars** in Vercel (Project → Settings → Environment Variables), see
   [`.env.example`](.env.example):
   - `DATABASE_URL` = the **pooled** string (serverless + SSE opens many
     connections, so pooling is required)
   - `DIRECT_URL` = the **direct** string
3. **Run the migration** against Neon once (locally, pointed at Neon):
   ```bash
   DIRECT_URL="<neon-direct-url>" npx prisma migrate deploy
   DIRECT_URL="<neon-direct-url>" DATABASE_URL="<neon-pooled-url>" npm run db:seed
   ```
4. **Deploy.** `prisma generate` runs automatically via the `postinstall` script.

### Scale notes

Each connected client (host + every player) polls Postgres roughly twice a
second via its SSE stream. For a typical session (≈40 players for ~10 minutes)
that's light, steady load Neon handles comfortably — but note Neon compute won't
scale to zero while a game is live. If you ever need to trim load, raise the
poll interval in [`lib/sse.ts`](lib/sse.ts) (`pollMs`, default 600ms).
