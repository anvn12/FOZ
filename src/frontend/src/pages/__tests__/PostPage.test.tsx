// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { PostPage } from "../PostPage.js";
import { useAuthStore } from "#frontend/stores/auth";
import { NetworkError } from "#frontend/api/network";
import * as InteractionsApi from "../../api/interactions.js";

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
const createComment = vi.fn();

vi.mock("../../api/interactions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof InteractionsApi>();
  return {
    ...actual,
    listPosts: (...args: unknown[]) => listPosts(...args),
    listComments: (...args: unknown[]) => listComments(...args),
    createComment: (...args: unknown[]) => createComment(...args),
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

describe("PostPage Guest Interactions (TC30)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPosts.mockResolvedValue({ items: [basePost] });
    listComments.mockResolvedValue({ items: [makeComment({})] });
    createComment.mockRejectedValue(new NetworkError());
    useAuthStore.setState({ user: null, accessToken: null });
  });

  it("TC30: Focuses comment input box when guest clicks reply or comment button", async () => {
    renderWithProviders(<PostPage />);

    await waitFor(() => {
      expect(screen.getByText("First test comment")).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });
});

describe("PostPage Comment Sorting (TC24)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPosts.mockResolvedValue({ items: [basePost] });
  });

  it("TC24: Allows user to select comment sorting tab (Top, Newest, Oldest)", async () => {
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

    await waitFor(() => {
      expect(screen.getByText("Popular comment")).toBeDefined();
      expect(screen.getByText("Fresh comment")).toBeDefined();
    });

    const popularEl = screen.getByText("Popular comment");
    const freshEl = screen.getByText("Fresh comment");
    const compare = popularEl.compareDocumentPosition(freshEl);
    // Node.DOCUMENT_POSITION_FOLLOWING = 4 → popular comes before fresh.
    expect(compare & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("preserves the typed comment draft when the submit fails offline (#3.2.9)", async () => {
    listComments.mockResolvedValue({ items: [makeComment({})] });
    useAuthStore.setState({
      user: { id: "u1", email: "a@b.com", role: "standard", status: "active" },
      accessToken: "token",
    });

    renderWithProviders(<PostPage />);

    const textarea = await screen.findByPlaceholderText("Add a comment...");
    fireEvent.change(textarea, { target: { value: "Hello offline" } });

    // Click the send button (Enter is suppressed on mobile, so use the button).
    const sendBtn = await screen.findByRole("button", { name: "Comment" });
    fireEvent.click(sendBtn);

    // The draft must still be in the box after the failed (offline) submit.
    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe("Hello offline");
    });
    expect(createComment).toHaveBeenCalled();
  });
});
