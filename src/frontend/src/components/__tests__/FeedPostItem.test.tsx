// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "../FeedPostItem.js";

describe("formatRelativeTime", () => {
  it("returns 'Just now' for missing or recent (<45s) timestamps", () => {
    expect(formatRelativeTime(null)).toBe("Just now");
    expect(formatRelativeTime(undefined)).toBe("Just now");
    expect(formatRelativeTime("invalid-date")).toBe("Just now");
    expect(formatRelativeTime(new Date().toISOString())).toBe("Just now");
  });

  it("formats minutes ago correctly", () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinsAgo)).toBe("5m ago");

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatRelativeTime(thirtyMinsAgo)).toBe("30m ago");
  });

  it("formats hours ago correctly", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe("1h ago");

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("formats days ago correctly", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe("2d ago");
  });
});
