import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 does not auto-load .env; Node provides loadEnvFile. It throws when
// no .env file exists (e.g. on Vercel, where env vars are injected), so ignore
// that — real env vars are already present in the environment.
try {
  process.loadEnvFile?.();
} catch {
  // no local .env file — fine
}

// Migrations need a direct (unpooled) connection — PgBouncer's transaction
// pooling can't run them. The Vercel Neon integration injects the unpooled
// string as POSTGRES_URL_NON_POOLING; DIRECT_URL/DATABASE_URL cover local dev.
// This is only consumed by migrate/introspect; `prisma generate` doesn't need
// it, so omit the datasource entirely when no URL is set (keeps generate
// working in environments without DB vars).
const migrationUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),
});
