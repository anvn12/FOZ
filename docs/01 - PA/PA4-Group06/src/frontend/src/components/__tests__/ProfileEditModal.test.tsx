// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { ProfileEditModal } from "../ProfileEditModal.js";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useUpdateAvatar: vi.fn(),
}));

describe("ProfileEditModal Component", () => {
  const mockProfile = {
    id: "profile-id",
    userAccountId: "user-id",
    displayName: "Alice Initial",
    bio: "Initial bio",
    location: "Oakland",
    website: "alice.com",
    avatarUrl: null,
    createdAt: "2026-07-20",
    updatedAt: "2026-07-20",
  };

  const mockMutate = vi.fn();
  const mockMutateAvatar = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileApi.useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutate,
      isPending: false,
    } as any);
    vi.mocked(profileApi.useUpdateAvatar).mockReturnValue({
      mutate: mockMutateAvatar,
      mutateAsync: mockMutateAvatar,
      isPending: false,
    } as any);
  });

  it("should render inputs with default values from profile", () => {
    renderWithProviders(
      <ProfileEditModal isOpen={true} onClose={mockOnClose} profile={mockProfile} />
    );

    const nameInput = screen.getByLabelText(/display name/i) as HTMLInputElement;
    const bioInput = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;
    const locationInput = screen.getByLabelText(/location/i) as HTMLInputElement;
    const websiteInput = screen.getByLabelText(/website/i) as HTMLInputElement;

    expect(nameInput.value).toBe("Alice Initial");
    expect(bioInput.value).toBe("Initial bio");
    expect(locationInput.value).toBe("Oakland");
    expect(websiteInput.value).toBe("alice.com");
  });

  it("should call mutate with updated details when submitted", async () => {
    renderWithProviders(
      <ProfileEditModal isOpen={true} onClose={mockOnClose} profile={mockProfile} />
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: "Alice Updated" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: "Alice Updated",
          bio: "Initial bio",
          location: "Oakland",
          website: "https://alice.com",
        })
      );
    });
  });
});
