// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { HomePage } from "../HomePage.js";
import { useAuthStore } from "#frontend/stores/auth";
import * as profileApi from "../../api/profile.js";
import { toast } from "react-hot-toast";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any;
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
  const actual = await importOriginal<typeof import("../../api/interactions.js")>();
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
    // Default mock return for useProfile
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: { displayName: "Alice", avatarUrl: null },
      isLoading: false,
    } as any);
  });

  it("should render homepage logo and mock posts for unauthenticated guest", async () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage feedType="latest" />);

    expect(screen.getAllByText("FOZ")).toBeDefined();
    await waitFor(() => {
      expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Log in")).toBeDefined();
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0);
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
