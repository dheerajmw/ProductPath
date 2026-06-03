import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

// Vercel Storage often injects POSTGRES_URL; Prisma requires DATABASE_URL
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING;
}

import { createApp } from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  logger.info({ port, env: process.env.NODE_ENV }, "ProductPath API listening");

  if (process.env.NODE_ENV === "development" && process.env.VERIFICATION_EXPIRY_POLL !== "false") {
    const hourMs = 60 * 60 * 1000;
    setInterval(() => {
      import("./lib/jobs.js")
        .then((j) => j.enqueue("verification.expire", {}))
        .catch((err) => logger.warn({ err }, "verification expiry poll failed"));
      import("./lib/jobs.js")
        .then((j) => j.enqueue("interest.expire", {}))
        .catch((err) => logger.warn({ err }, "interest expiry poll failed"));
    }, hourMs);
  }
});
