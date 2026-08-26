// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { toast } from "react-hot-toast";
import {
  fetchWithNetworkGuard,
  isOffline,
  NetworkError,
  ServerUnavailableError,
  showOfflineToast,
} from "../network.js";

vi.mock("react-hot-toast", () => ({
  toast: { error: vi.fn() },
}));

describe("network guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    // Reset navigator.onLine
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });

  it("isOffline returns true when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    expect(isOffline()).toBe(true);
  });

  it("throws NetworkError and toasts when offline before sending", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchWithNetworkGuard("/api/v1/test")).rejects.toBeInstanceOf(NetworkError);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "You're offline. Check your connection and try again.",
      expect.objectContaining({ id: "offline-toast" }),
    );
  });

  it("throws ServerUnavailableError (not NetworkError) when fetch rejects while still online", async () => {
    // The browser still reports a live connection — a flaky/unreachable
    // server (or our own timeout) is not the same thing as the user being
    // offline, so this must NOT surface as "you're offline".
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchWithNetworkGuard("/api/v1/test")).rejects.toBeInstanceOf(
      ServerUnavailableError,
    );
    expect(toast.error).toHaveBeenCalledWith(
      "We're having trouble reaching the server. Please try again.",
      expect.objectContaining({ id: "server-error-toast" }),
    );
  });

  it("throws NetworkError and toasts the offline message when the browser goes offline mid-request", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        // Simulate the connection dropping while the request was in flight.
        Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
        return Promise.reject(new TypeError("Failed to fetch"));
      }),
    );

    await expect(fetchWithNetworkGuard("/api/v1/test")).rejects.toBeInstanceOf(NetworkError);
    expect(toast.error).toHaveBeenCalledWith(
      "You're offline. Check your connection and try again.",
      expect.objectContaining({ id: "offline-toast" }),
    );
  });

  it("returns the response on success", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    const okResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse));

    const res = await fetchWithNetworkGuard("/api/v1/test");
    expect(res).toBe(okResponse);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("showOfflineToast dedupes to a single toast via stable id", () => {
    showOfflineToast();
    showOfflineToast();
    expect(toast.error).toHaveBeenCalledTimes(2);
    // Both calls carry the same stable id, so react-hot-toast replaces rather
    // than stacks them.
    expect((toast.error as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.id).toBe("offline-toast");
    expect((toast.error as ReturnType<typeof vi.fn>).mock.calls[1]?.[1]?.id).toBe("offline-toast");
  });
});
