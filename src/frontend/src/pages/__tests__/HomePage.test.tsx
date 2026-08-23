// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import type * as ReactRouter from "react-router-dom";
import { renderWithProviders } from "../../test/utils.js";
import { HomePage } from "../HomePage.js";
import { GUEST_LOGIN_PROMPT_KEY } from "#frontend/components/GuestLoginModal";
import { useAuthStore } from "#frontend/stores/auth";
import * as profileApi from "../../api/profile.js";
import * as interactionsApi from "../../api/interactions.js";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as typeof ReactRouter;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock profiles api
vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

// Mock interactions api
vi.mock("../../api/interactions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof interactionsApi>();
  return {
    ...actual,
    listFeed: vi.fn().mockResolvedValue({
      items: [
        {
          id: "post-1",
          authorId: "u1",
          content: "test 1",
          parentId: null,
          visibilityState: "public",
          lifecycleState: "active",
          createdAt: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          liked: false,
        },
        {
          id: "post-2",
          authorId: "u2",
          content: "test 2",
          parentId: null,
          visibilityState: "public",
          lifecycleState: "active",
          createdAt: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          liked: false,
        },
      ],
      nextCursor: null,
    }),
  };
});

// Mock react-hot-toast
vi.mock("react-hot-toast", () => {
  const toastMock = vi.fn();
  return {
    toast: toastMock,
    default: toastMock,
  };
});

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== "undefined" && typeof localStorage.clear === "function") {
      localStorage.clear();
    }
    // Default mock return for useProfile
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: { displayName: "Alice", avatarUrl: null },
      isLoading: false,
    } as unknown as ReturnType<typeof profileApi.useProfile>);
  });

  it("should render homepage logo and mock posts for unauthenticated guest", async () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    expect(screen.getAllByAltText("FOZ").length).toBeGreaterThan(0);
    // First-time guests get a login prompt modal
    expect(screen.getByText("Join FOZ")).toBeDefined();
    await waitFor(() => {
      expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0);
  });

  it("should remember dismissal of the guest login modal", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    const { unmount } = renderWithProviders(<HomePage feedType="latest" />);

    expect(screen.getByText("Join FOZ")).toBeDefined();
    fireEvent.click(screen.getByText("Not now"));
    expect(localStorage.getItem(GUEST_LOGIN_PROMPT_KEY)).toBe("1");
    expect(screen.queryByText("Join FOZ")).toBeNull();

    unmount();
    renderWithProviders(<HomePage feedType="latest" />);
    expect(screen.queryByText("Join FOZ")).toBeNull();
  });

  it("should show the login modal when a guest clicks the Profile button", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    // Click profile link in mobile view / sidebar
    const profileBtns = screen.getAllByLabelText("Profile");
    const firstBtn = profileBtns[0];
    if (firstBtn) {
      fireEvent.click(firstBtn);
    }

    expect(screen.getByText("Log in to view your profile")).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("should remove Log in button and open CreatePostModal for authenticated user on Create click", async () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage feedType="latest" />);

    // Log in button should be gone
    expect(screen.queryByText("Log in")).toBeNull();
    // Guest login prompt should not appear for authenticated users
    expect(screen.queryByText("Join FOZ")).toBeNull();

    // Click create button
    const createBtns = screen.getAllByLabelText("Create");
    const firstCreateBtn = createBtns[0];
    if (firstCreateBtn) {
      fireEvent.click(firstCreateBtn);
    }

    // Verify modal is opened
    expect(screen.getByText("Create Post")).toBeDefined();
    expect(screen.getByPlaceholderText("Start a discussion on FOZ...")).toBeDefined();
  });

  it("should show the login modal when a guest clicks the Create button", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    // Click create button
    const createBtns = screen.getAllByLabelText("Create");
    const firstCreateBtn = createBtns[0];
    if (firstCreateBtn) {
      fireEvent.click(firstCreateBtn);
    }

    // Verify the login modal appears instead of a redirect
    expect(screen.getByText("Log in to create a post")).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("should open LogoutDialog when clicking Log out button", async () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage feedType="latest" />);

    // Open the More menu
    fireEvent.pointerDown(screen.getByText("More"));

    // Click Log out
    const logoutBtn = screen.getByText("Log out");
    fireEvent.click(logoutBtn);

    // Logout dialog confirmation text should appear
    expect(screen.getByText("Log out of your account?")).toBeDefined();
  });

  it("should prompt login modal and not fetch next page when guest clicks Load more", async () => {
    const listFeedMock = vi.mocked(interactionsApi.listFeed);
    listFeedMock.mockResolvedValueOnce({
      items: [
        {
          id: "post-1",
          authorId: "u1",
          content: "test 1",
          parentId: null,
          visibilityState: "public",
          lifecycleState: "active",
          createdAt: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          liked: false,
        },
      ],
      nextCursor: "cursor-page-2",
    });

    useAuthStore.setState({ user: null, accessToken: null });
    // Dismiss initial first-visit prompt so we isolate the Load more prompt
    localStorage.setItem(GUEST_LOGIN_PROMPT_KEY, "1");

    renderWithProviders(<HomePage feedType="latest" />);

    // Initial prompt should not be visible
    expect(screen.queryByText("Join FOZ")).toBeNull();

    // Wait for post and Load more button to render
    await waitFor(() => {
      expect(screen.getByText("Load more")).toBeDefined();
    });

    // Check initial feed call count
    expect(listFeedMock).toHaveBeenCalledTimes(1);

    // Click Load more as a guest
    fireEvent.click(screen.getByText("Load more"));

    // Login modal should be displayed
    expect(screen.getByText("Log in to view more posts")).toBeDefined();
    // listFeed should NOT have been called again
    expect(listFeedMock).toHaveBeenCalledTimes(1);
  });

  it("should fetch next page when authenticated user clicks Load more", async () => {
    const listFeedMock = vi.mocked(interactionsApi.listFeed);
    listFeedMock
      .mockResolvedValueOnce({
        items: [
          {
            id: "post-1",
            authorId: "u1",
            content: "test 1",
            parentId: null,
            visibilityState: "public",
            lifecycleState: "active",
            createdAt: new Date().toISOString(),
            likeCount: 0,
            commentCount: 0,
            liked: false,
          },
        ],
        nextCursor: "cursor-page-2",
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: "post-page-2",
            authorId: "u2",
            content: "test 2",
            parentId: null,
            visibilityState: "public",
            lifecycleState: "active",
            createdAt: new Date().toISOString(),
            likeCount: 0,
            commentCount: 0,
            liked: false,
          },
        ],
        nextCursor: null,
      });

    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage feedType="latest" />);

    // Wait for post and Load more button to render
    await waitFor(() => {
      expect(screen.getByText("Load more")).toBeDefined();
    });

    expect(listFeedMock).toHaveBeenCalledTimes(1);

    // Click Load more as an authenticated user
    fireEvent.click(screen.getByText("Load more"));

    // Next page should be fetched
    await waitFor(() => {
      expect(listFeedMock).toHaveBeenCalledTimes(2);
    });

    // Login modal should NOT appear
    expect(screen.queryByText("Log in to view more posts")).toBeNull();
    expect(screen.queryByText("Join FOZ")).toBeNull();
  });

  it("requests the matching feed type and marks the active tab aria-selected", async () => {
    const listFeedMock = vi.mocked(interactionsApi.listFeed);
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage feedType="for-you" />);

    await waitFor(() => {
      expect(listFeedMock).toHaveBeenCalledWith("for-you", undefined);
    });
    expect(screen.getByRole("tab", { name: "For You" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Latest" }).getAttribute("aria-selected")).toBe("false");
  });

  it("shows the empty-feed placeholder when no posts are returned", async () => {
    vi.mocked(interactionsApi.listFeed).mockResolvedValueOnce({ items: [], nextCursor: null });
    useAuthStore.setState({ user: null, accessToken: null });

    renderWithProviders(<HomePage feedType="latest" />);

    await waitFor(() => {
      expect(screen.getByText("No posts yet. Be the first to share something!")).toBeDefined();
    });
  });
});
