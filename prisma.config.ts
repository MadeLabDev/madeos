import * as dotenv from "dotenv";
import * as path from "path";
import { defineConfig, env } from "prisma/config";

// Load correct .env file based on NODE_ENV
// Production: .env.production
// Development: .env.local (if exists), then .env
const isProduction = process.env.NODE_ENV === "production";

let envPath: string;

if (isProduction) {
  // Production: use .env.production
  envPath = path.resolve(process.cwd(), ".env.production");
  console.log("[Prisma] Loading production config:", envPath);
} else {
  // Development: try .env.local first, then .env
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const envDefault = path.resolve(process.cwd(), ".env");

  try {
    // Try .env.local first
    dotenv.config({ path: envLocalPath });
    envPath = envLocalPath;
    console.log("[Prisma] Loaded development config from:", envLocalPath);
  } catch {
    // Fall back to .env
    envPath = envDefault;
    console.log("[Prisma] Loaded development config from:", envDefault);
  }
}

// Load the selected env file
dotenv.config({ path: envPath });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seeds/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
