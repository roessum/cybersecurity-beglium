import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 does not auto-load .env; Node 24 provides loadEnvFile.
process.loadEnvFile?.();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (unpooled) connection — PgBouncer's transaction
    // pooling can't run them. Falls back to DATABASE_URL for local dev.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
