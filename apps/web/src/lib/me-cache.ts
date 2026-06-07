import { api, type User } from "@/lib/api";
import { authDebug } from "@/lib/auth-debug";

const ME_CACHE_MS = 30_000;

let cached: { user: User; fetchedAt: number } | null = null;
let inflight: Promise<User> | null = null;
let generation = 0;

export function getCachedUser(): User | null {
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt >= ME_CACHE_MS) return null;
  return cached.user;
}

/** Seed cache after login — cancels stale in-flight /auth/me from app boot. */
export function seedMeCache(user: User) {
  generation += 1;
  cached = { user, fetchedAt: Date.now() };
  inflight = null;
  authDebug({
    event: "me-cache:seed",
    user: { id: user.id, email: user.email },
    isAuthenticated: true,
  });
}

export function invalidateMeCache() {
  generation += 1;
  cached = null;
  inflight = null;
}

/** Network call to /auth/me — bypasses cache (use after login to verify session). */
export async function fetchMeFresh(sessionToken?: string | null): Promise<User> {
  const { user } = await api.me(sessionToken);
  cached = { user, fetchedAt: Date.now() };
  inflight = null;
  return user;
}

/** Dedupe `/auth/me` across sidebar + page loads within a short window. */
export async function fetchMeCached(): Promise<User> {
  const hit = getCachedUser();
  if (hit) return hit;

  if (!inflight) {
    const gen = generation;
    inflight = api
      .me()
      .then(({ user }) => {
        if (gen !== generation) {
          return getCachedUser() ?? user;
        }
        cached = { user, fetchedAt: Date.now() };
        return user;
      })
      .finally(() => {
        inflight = null;
      });
  }

  try {
    return await inflight;
  } catch (err) {
    const fallback = getCachedUser();
    if (fallback) return fallback;
    throw err;
  }
}
