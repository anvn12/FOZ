// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { PostPage } from "../PostPage.js";
import { useAuthStore } from "#frontend/stores/auth";
import type * as InteractionsApi from "../../api/interactions.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ postId: "post-1" }),
  };
});

vi.mock("react-hot-toast", () => {
  const toastMock = vi.fn();
  return { toast: toastMock, default: toastMock };
});

const listPosts = vi.fn();
const listComments = vi.fn();

vi.mock("../../api/interactions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof InteractionsApi>();
  return {
    ...actual,
    listPosts: (...args: unknown[]) => listPosts(...args),
    listComments: (...args: unknown[]) => listComments(...args),
  };
});

vi.mock("#frontend/api/profile", () => ({
  useProfile: vi.fn().mockReturnValue({
    data: { displayName: "Alice", username: "alice", avatarUrl: null },
    isLoading: false,
  }),
}));

const basePost = {
  id: "post-1",
  authorId: "u1",
  content: "Test post",
  createdAt: new Date().toISOString(),
  visibilityState: "public",
  lifecycleState: "active",
  likeCount: 0,
  commentCount: 0,
  liked: false,
};

const makeComment = (overrides: Record<string, unknown>) => ({
  id: "c1",
  postId: "post-1",
  parentCommentId: null,
  authorId: "u1",
  body: "comment",
  visibilityState: "public",
  lifecycleState: "active",
  createdAt: new Date(Date.now() - 3600_000).toISOString(),
  likeCount: 0,
  liked: false,
  replyCount: 0,
  ...overrides,
});

describe("PostPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPosts.mockResolvedValue({ items: [basePost] });
    listComments.mockResolvedValue({ items: [] });
    useAuthStore.setState({ user: null, accessToken: null });
  });

  it("shows a login modal when a guest focuses the comment box instead of redirecting", async () => {
    listComments.mockResolvedValue({ items: [makeComment({})] });
    renderWithProviders(<PostPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Add a comment...")).toBeDefined();
    });

    fireEvent.focus(screen.getByPlaceholderText("Add a comment..."));

    await waitFor(() => {
      expect(screen.getByText("Log in to leave a comment")).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("re-sorts top-level comments by Top mode when like counts change (#191)", async () => {
    const popular = makeComment({
      id: "popular",
      body: "Popular comment",
      likeCount: 50,
      replyCount: 5,
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    });
    const fresh = makeComment({
      id: "fresh",
      body: "Fresh comment",
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    });

    listComments.mockResolvedValue({ items: [fresh, popular] });
    renderWithProviders(<PostPage />);

    // Both top-level comments render.
    await waitFor(() => {
      expect(screen.getByText("Popular comment")).toBeDefined();
      expect(screen.getByText("Fresh comment")).toBeDefined();
    });

    // Verify the DOM order: in Top mode the high-engagement comment ranks first.
    // The comments list is the container that holds the comment bodies.
    const popularEl = screen.getByText("Popular comment");
    const freshEl = screen.getByText("Fresh comment");
    const compare = popularEl.compareDocumentPosition(freshEl);
    // Node.DOCUMENT_POSITION_FOLLOWING = 4 → popular comes before fresh.
    expect(compare & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
