import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@productpath/ui"],
  // Include workspace packages in the serverless bundle (Vercel monorepo)
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
