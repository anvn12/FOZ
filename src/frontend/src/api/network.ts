import { toast } from "react-hot-toast";

/**
 * Network error sentinel. Thrown when a request cannot reach the server
 * (offline, DNS failure, connection refused, etc.).
 */
export class NetworkError extends Error {
  constructor(message = "You're offline. Check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
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
 * Shared fetch wrapper used by every API module.
 *
 * - Before sending: if the browser reports offline, toast + throw immediately
 *   (no pointless request).
 * - After sending: if the request throws a network-level error (fetch rejects),
 *   toast + throw `NetworkError` so callers can distinguish connectivity
 *   problems from API errors.
 */
export async function fetchWithNetworkGuard(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (isOffline()) {
    showOfflineToast();
    throw new NetworkError();
  }
  try {
    return await fetch(input, init);
  } catch {
    showOfflineToast();
    throw new NetworkError();
  }
}
