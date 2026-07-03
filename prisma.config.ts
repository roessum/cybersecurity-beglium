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
    url: env("DATABASE_URL"),
  },
});
