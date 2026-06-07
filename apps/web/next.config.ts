import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Monorepo: load repo-root .env (NEXT_PUBLIC_API_URL, etc.)
loadEnvConfig(path.join(__dirname, "../.."));

const remoteApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
const useApiProxy = !/localhost|127\.0\.0\.1/.test(remoteApiUrl);

const nextConfig: NextConfig = {
  transpilePackages: ["@productpath/ui"],
  // Include workspace packages in the serverless bundle (Vercel monorepo)
  outputFileTracingRoot: path.join(__dirname, "../.."),
  async rewrites() {
    if (!useApiProxy) return [];
    const base = remoteApiUrl.replace(/\/$/, "");
    return [
      {
        source: "/pp-api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
