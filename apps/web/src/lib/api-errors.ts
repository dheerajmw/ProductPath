import { ApiError } from "@/lib/api";

/** User-facing message — never maps 401 or 5xx to "Cannot reach API". */
export function formatApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function isNetworkError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.code === "NETWORK_ERROR";
}

export function isUnauthorized(err: unknown): err is ApiError {
  return err instanceof ApiError && (err.status === 401 || err.code === "UNAUTHORIZED");
}

export function isServerError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status >= 500;
}
