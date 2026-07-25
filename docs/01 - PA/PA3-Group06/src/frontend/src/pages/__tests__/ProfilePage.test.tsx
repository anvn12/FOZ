// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { ProfilePage } from "../ProfilePage.js";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useUpdateAvatar: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  updateAvatar: vi.fn(),
}));

describe("ProfilePage Component", () => {
  it("should render loading state initially", () => {
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithProviders(<ProfilePage />, { route: "/profiles/user-id" });
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("should render profile display name and details", async () => {
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: {
        id: "profile-id",
        userAccountId: "user-id",
        displayName: "Alice Test",
        bio: "My test bio",
        location: "Oakland",
        website: "test.com",
        avatarUrl: null,
        createdAt: "2026-07-20",
        updatedAt: "2026-07-20",
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithProviders(<ProfilePage />, { route: "/profiles/user-id" });
    await waitFor(() => {
      expect(screen.getByText("Alice Test")).toBeDefined();
      expect(screen.getByText("My test bio")).toBeDefined();
      expect(screen.getByText("Oakland")).toBeDefined();
    });
  });

  it("should truncate long bios and expand when clicking 'view more'", async () => {
    const longBio = "a".repeat(120);
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: {
        id: "profile-id",
        userAccountId: "user-id",
        displayName: "Alice Test",
        bio: longBio,
        location: "Oakland",
        website: "test.com",
        avatarUrl: null,
        createdAt: "2026-07-20",
        updatedAt: "2026-07-20",
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithProviders(<ProfilePage />, { route: "/profiles/user-id" });

    // Should show truncated bio
    const truncatedText = "a".repeat(100) + "...";
    expect(screen.getByText(new RegExp(truncatedText))).toBeDefined();
    
    // Should have a "view more" button
    const button = screen.getByRole("button", { name: /view more/i });
    expect(button).toBeDefined();

    // Click view more
    fireEvent.click(button);

    // Should now display the full bio and "show less"
    await waitFor(() => {
      expect(screen.getByText(longBio)).toBeDefined();
      expect(screen.getByRole("button", { name: /show less/i })).toBeDefined();
    });
  });
});
