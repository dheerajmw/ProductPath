import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Monorepo: load repo-root .env (NEXT_PUBLIC_API_URL, etc.)
loadEnvConfig(path.join(__dirname, "../.."));

const nextConfig: NextConfig = {
  transpilePackages: ["@productpath/ui"],
  // Include workspace packages in the serverless bundle (Vercel monorepo)
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
