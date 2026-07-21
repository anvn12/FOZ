// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { LogoutDialog } from "../LogoutDialog.js";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

describe("LogoutDialog Component", () => {
  const mockUser = {
    id: "user-123",
    email: "user@example.com",
    role: "standard",
    status: "active",
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render profile picture image when profile avatarUrl is available", () => {
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: {
        id: "prof-123",
        userAccountId: "user-123",
        displayName: "Jane Doe",
        bio: null,
        location: null,
        website: null,
        avatarUrl: "https://example.com/avatar.jpg",
        createdAt: "2026-07-20",
        updatedAt: "2026-07-20",
      },
    } as any);

    renderWithProviders(
      <LogoutDialog user={mockUser} open={true} onClose={mockOnClose} />
    );

    const avatarImg = screen.getByRole("img", { name: "Jane Doe" }) as HTMLImageElement;
    expect(avatarImg).toBeDefined();
    expect(avatarImg.src).toBe("https://example.com/avatar.jpg");
  });

  it("should render fallback initials when profile avatarUrl is null but displayName exists", () => {
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: {
        id: "prof-123",
        userAccountId: "user-123",
        displayName: "Jane Doe",
        bio: null,
        location: null,
        website: null,
        avatarUrl: null,
        createdAt: "2026-07-20",
        updatedAt: "2026-07-20",
      },
    } as any);

    renderWithProviders(
      <LogoutDialog user={mockUser} open={true} onClose={mockOnClose} />
    );

    expect(screen.getByText("J")).toBeDefined();
  });
});
