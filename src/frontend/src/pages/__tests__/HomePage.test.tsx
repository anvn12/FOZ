// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { HomePage } from "../HomePage.js";
import { useAuthStore } from "#frontend/stores/auth";
import * as profileApi from "../../api/profile.js";

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

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return for useProfile
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: { displayName: "Alice", avatarUrl: null },
      isLoading: false,
    } as any);
  });

  it("should render homepage logo and mock posts for unauthenticated guest", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage />);

    expect(screen.getAllByText("FOZ")).toBeDefined();
    expect(screen.getByText("ohiris")).toBeDefined();
    expect(screen.getByText("jillianbydesignn")).toBeDefined();
    expect(screen.getAllByText("Log in")).toBeDefined();
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0);
  });

  it("should redirect guest to login when clicking a protected link", () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderWithProviders(<HomePage />);

    // Click profile link in mobile view / sidebar
    const profileBtns = screen.getAllByLabelText("Profile");
    const firstBtn = profileBtns[0];
    if (firstBtn) {
      fireEvent.click(firstBtn);
    }

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should remove Log in button and allow authenticated user to open compose modal", async () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage />);

    // Log in button should be gone
    expect(screen.queryByText("Log in")).toBeNull();

    // Click create button
    const createBtns = screen.getAllByLabelText("Create");
    const firstCreateBtn = createBtns[0];
    if (firstCreateBtn) {
      fireEvent.click(firstCreateBtn);
    }

    // Compose modal should be visible
    expect(screen.getByText("New Post")).toBeDefined();

    // Fill post
    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: "Hello world from vitest!" } });

    // Submit
    const postBtn = screen.getByRole("button", { name: "Post" });
    fireEvent.click(postBtn);

    // Verify post prepended in feed
    await waitFor(() => {
      expect(screen.getByText("Hello world from vitest!")).toBeDefined();
    });
  });

  it("should open LogoutDialog when clicking Log out button", async () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });

    renderWithProviders(<HomePage />);

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
