// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { toast } from "react-hot-toast";
import { fetchWithNetworkGuard, isOffline, NetworkError, showOfflineToast } from "../network.js";

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

  it("throws NetworkError and toasts when fetch rejects (server unreachable)", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchWithNetworkGuard("/api/v1/test")).rejects.toBeInstanceOf(NetworkError);
    expect(toast.error).toHaveBeenCalled();
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
