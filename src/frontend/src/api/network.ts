import { toast } from "react-hot-toast";

/**
 * Network error sentinel. Thrown ONLY when the browser itself reports no
 * internet connection (navigator.onLine === false). Do not throw this for a
 * failed/timed-out fetch while the browser still reports being online — that
 * means the server (or our own request timeout) is the problem, not the
 * user's connection. See `ServerUnavailableError` for that case.
 */
export class NetworkError extends Error {
  constructor(message = "You're offline. Check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Thrown when a request fails or times out while the browser still reports
 * being online — i.e. our backend is slow, unreachable, or dropped the
 * connection. Distinct from `NetworkError` so the UI doesn't tell the user
 * they're offline when they aren't.
 */
export class ServerUnavailableError extends Error {
  constructor(message = "We're having trouble reaching the server. Please try again.") {
    super(message);
    this.name = "ServerUnavailableError";
  }
}

/** True when the browser reports no internet connection. */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Show the offline toast. Uses a stable toast id so react-hot-toast replaces
 * the existing offline toast instead of stacking multiple copies, while the
 * `duration` re-arms naturally once it disappears.
 */
export function showOfflineToast(): void {
  toast.error("You're offline. Check your connection and try again.", {
    id: "offline-toast",
    duration: 4000,
  });
}

/**
 * Show the server-unavailable toast (slow/unreachable backend, not the
 * user's connection). Stable id so retries collapse into one toast.
 */
export function showServerErrorToast(): void {
  toast.error("We're having trouble reaching the server. Please try again.", {
    id: "server-error-toast",
    duration: 4000,
  });
}

/**
 * Shared fetch wrapper used by every API module.
 *
 * - Before sending: if the browser reports offline, toast + throw immediately
 *   (no pointless request).
 * - After sending: if the request throws (fetch rejects, or our own timeout
 *   aborts it), re-check `navigator.onLine` to decide what actually
 *   happened — only genuine offline gets the "you're offline" toast; a
 *   flaky/slow/unreachable server while still online gets a distinct
 *   `ServerUnavailableError` instead, so we never blame the user's
 *   connection for our own backend's problems.
 */
export async function fetchWithNetworkGuard(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000,
): Promise<Response> {
  if (isOffline()) {
    showOfflineToast();
    throw new NetworkError();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (init?.signal) {
    init.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } catch {
    if (isOffline()) {
      showOfflineToast();
      throw new NetworkError();
    }
    showServerErrorToast();
    throw new ServerUnavailableError();
  } finally {
    clearTimeout(timeoutId);
  }
}
