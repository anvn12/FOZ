import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { signAccessToken, verifyAccessToken } from "./jwt.js";

describe("jwt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("signs and verifies a token round-trip", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signAccessToken({ sub: "u1", role: "standard", status: "active" });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe("u1");
    expect(decoded.role).toBe("standard");
    expect(decoded.status).toBe("active");
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken({ sub: "u1", role: "standard", status: "active" });
    const tampered = token.slice(0, -2) + "ZZ";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("rejects an expired token", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signAccessToken({ sub: "u1", role: "standard", status: "active" });
    // 20 minutes later — exceeds the 15-minute TTL.
    vi.setSystemTime(new Date("2026-01-01T00:20:00Z"));
    expect(() => verifyAccessToken(token)).toThrow();
  });
});
