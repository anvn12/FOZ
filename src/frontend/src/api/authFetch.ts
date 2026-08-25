import { fetchWithNetworkGuard } from "#frontend/api/network";
import { silentRefresh, useAuthStore } from "#frontend/stores/auth";

/**
 * Fetch wrapper for authenticated API calls: attaches the current access
 * token and, on a 401, performs a single silent refresh (via the httpOnly
 * refresh cookie) and retries once before giving up.
 *
 * Access tokens are short-lived (JWT_ACCESS_TTL_MIN) and there is no
 * background timer that renews them — without this retry, every request
 * made after the token expires would fail forever instead of transparently
 * picking up a new token, which is what made the app appear to "sign out"
 * mid-session even though the refresh cookie was still valid.
 */
export async function authFetch(
  path: string,
  init: RequestInit = {},
  attempt = 0,
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchWithNetworkGuard(path, { ...init, credentials: "include", headers });

  if (res.status === 401 && attempt === 0) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      return authFetch(path, init, attempt + 1);
    }
  }

  return res;
}
