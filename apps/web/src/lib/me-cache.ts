import { api, type User } from "@/lib/api";

const ME_CACHE_MS = 30_000;

let cached: { user: User; fetchedAt: number } | null = null;
let inflight: Promise<User> | null = null;

/** Dedupe `/auth/me` across sidebar + page loads within a short window. */
export async function fetchMeCached(): Promise<User> {
  if (cached && Date.now() - cached.fetchedAt < ME_CACHE_MS) {
    return cached.user;
  }

  if (!inflight) {
    inflight = api
      .me()
      .then(({ user }) => {
        cached = { user, fetchedAt: Date.now() };
        return user;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export function invalidateMeCache() {
  cached = null;
  inflight = null;
}
