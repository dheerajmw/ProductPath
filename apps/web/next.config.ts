import path from "node:path";
import { createRequire } from "node:module";
import type { NextConfig } from "next";

// Load monorepo root .env for local builds (Vercel injects env in the dashboard).
const require = createRequire(import.meta.url);
try {
  require("@next/env").loadEnvConfig(path.join(__dirname, "../.."));
} catch {
  /* @next/env ships with next — optional during type-only checks */
}

const nextConfig: NextConfig = {
  transpilePackages: ["@productpath/ui"],
  // Include workspace packages in the serverless bundle (Vercel monorepo)
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
