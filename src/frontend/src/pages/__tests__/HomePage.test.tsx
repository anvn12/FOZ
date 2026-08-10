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
import type * as InteractionsApi from "../../api/interactions.js";

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
  const actual = await importOriginal<typeof InteractionsApi>();
  return {
    ...actual,
    listFeed: vi.fn().mockResolvedValue({
      items: [
        { id: "post-1", authorId: "u1", authorName: "ohiris", content: "test 1", createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0, isLiked: false },
        { id: "post-2", authorId: "u2", authorName: "jillianbydesignn", content: "test 2", createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0, isLiked: false },
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
    localStorage.clear();
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

  it("should redirect guest to login when clicking a protected link", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    // Click profile link in mobile view / sidebar
    const profileBtns = screen.getAllByLabelText("Profile");
    const firstBtn = profileBtns[0];
    if (firstBtn) {
      fireEvent.click(firstBtn);
    }

    expect(mockNavigate).toHaveBeenCalledWith("/login");
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

  it("should redirect guest to login when clicking Create button", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    // Click create button
    const createBtns = screen.getAllByLabelText("Create");
    const firstCreateBtn = createBtns[0];
    if (firstCreateBtn) {
      fireEvent.click(firstCreateBtn);
    }

    // Verify it redirects
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should open LogoutDialog when clicking Log out button", async () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage feedType="latest" />);

    // Open desktop More menu
    const moreBtn = screen.getByLabelText("More");
    fireEvent.click(moreBtn);

    // Click Log out
    const logoutBtn = screen.getByText("Log out");
    fireEvent.click(logoutBtn);

    // Logout dialog confirmation text should appear
    expect(screen.getByText("Log out of your account?")).toBeDefined();
  });
});
