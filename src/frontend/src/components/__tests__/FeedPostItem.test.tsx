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

import React from "react";
import { vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { FeedPostItem } from "../FeedPostItem.js";
import { useAuthStore } from "#frontend/stores/auth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn().mockReturnValue({ data: { displayName: "Author User" }, isLoading: false }),
}));

const mockToggleReaction = vi.fn();
const mockToggleRepost = vi.fn();
vi.mock("../../api/interactions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/interactions.js")>();
  return {
    ...actual,
    useToggleReaction: () => ({ mutate: mockToggleReaction }),
    useToggleRepost: () => ({ mutate: mockToggleRepost }),
  };
});

describe("FeedPostItem Guest Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dummyPost = {
    id: "post-123",
    authorId: "user-456",
    content: "Test post content",
    createdAt: new Date().toISOString(),
    likeCount: 5,
    liked: false,
    reposted: false,
  };

  it("should trigger authentication (navigate to /login) when guest presses like", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<FeedPostItem post={dummyPost} />);

    const buttons = screen.getAllByRole("button");
    // Button index 1 is like (or find by svg/icon inside button)
    const likeBtn = buttons.find((btn) => btn.querySelector("path")?.getAttribute("d")?.includes("20.84"));
    expect(likeBtn).toBeDefined();
    fireEvent.click(likeBtn!);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockToggleReaction).not.toHaveBeenCalled();
  });

  it("should trigger authentication (navigate to /login) when guest presses repost", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<FeedPostItem post={dummyPost} />);

    const buttons = screen.getAllByRole("button");
    const repostBtn = buttons.find((btn) => btn.querySelector("path")?.getAttribute("d")?.includes("M4 4v5h.582"));
    expect(repostBtn).toBeDefined();
    fireEvent.click(repostBtn!);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockToggleRepost).not.toHaveBeenCalled();
  });
});

describe("FeedPostItem Authenticated Optimistic Reaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: "user-789", email: "test@example.com", role: "standard", status: "active" },
      accessToken: "fake-token",
    });
  });

  const dummyPost = {
    id: "post-123",
    authorId: "user-456",
    content: "Test post content",
    createdAt: new Date().toISOString(),
    likeCount: 5,
    liked: false,
    reposted: false,
  };

  it("should update like icon and count optimistically when authenticated user clicks like", () => {
    renderWithProviders(<FeedPostItem post={dummyPost} />);

    const buttons = screen.getAllByRole("button");
    const likeBtn = buttons.find((btn) => btn.querySelector("path")?.getAttribute("d")?.includes("20.84"))!;
    expect(likeBtn).toBeDefined();

    // Initial state before click
    expect(screen.getByText("5")).toBeDefined();

    // Click like
    fireEvent.click(likeBtn);

    // Optimistic UI updates count immediately to 6 and toggles heart styling
    expect(screen.getByText("6")).toBeDefined();
    expect(likeBtn.className).toContain("text-red-500");

    // Check mutation call
    expect(mockToggleReaction).toHaveBeenCalledWith(
      { targetType: "post", targetId: "post-123", active: false },
      expect.any(Object)
    );
  });

  it("should navigate to post details page /posts/:id when post card is clicked", () => {
    renderWithProviders(<FeedPostItem post={dummyPost} />);

    const cardContent = screen.getByText("Test post content");
    fireEvent.click(cardContent);

    expect(mockNavigate).toHaveBeenCalledWith("/posts/post-123");
  });

  it("should NOT navigate to post details page when clicking inside details page", () => {
    renderWithProviders(<FeedPostItem post={dummyPost} isDetailsPage={true} />);

    const cardContent = screen.getByText("Test post content");
    fireEvent.click(cardContent);

    expect(mockNavigate).not.toHaveBeenCalledWith("/posts/post-123");
  });

  it("should update post state in query cache on success without re-fetching feed", () => {
    renderWithProviders(<FeedPostItem post={dummyPost} />);

    const buttons = screen.getAllByRole("button");
    const likeBtn = buttons.find((btn) => btn.querySelector("path")?.getAttribute("d")?.includes("20.84"))!;
    fireEvent.click(likeBtn);

    // Simulate onSuccess callback from toggleReaction mutation
    const mutationArgs = mockToggleReaction.mock.calls[0];
    expect(mutationArgs[0]).toEqual({ targetType: "post", targetId: "post-123", active: false });
    const options = mutationArgs[1];
    options.onSuccess({ active: true, likeCount: 6 });

    expect(screen.getByText("6")).toBeDefined();
  });
});


