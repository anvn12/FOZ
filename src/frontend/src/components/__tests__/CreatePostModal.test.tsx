// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { CreatePostModal } from "../CreatePostModal.js";
import { useAuthStore } from "#frontend/stores/auth";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

vi.mock("../../api/interactions.js", () => ({
  createPost: vi.fn().mockResolvedValue({ id: "new-post-1" }),
}));

vi.mock("react-hot-toast", () => {
  const toastMock = vi.fn();
  return {
    toast: toastMock,
    default: toastMock,
  };
});

describe("CreatePostModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: "user-1", email: "user@test.com", role: "standard", status: "active" },
      accessToken: "token-123",
    });
    vi.mocked(profileApi.useProfile).mockReturnValue({
      data: { displayName: "Test User", avatarUrl: null },
      isLoading: false,
    } as any);

    // Mock URL.createObjectURL and revokeObjectURL
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake-image");
    } else {
      vi.spyOn(globalThis.URL, "createObjectURL").mockReturnValue("blob:http://localhost/fake-image");
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => {});
    }
  });

  it("should not render when isOpen is false", () => {
    renderWithProviders(<CreatePostModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText("Create Post")).toBeNull();
  });

  it("should render modal when isOpen is true", () => {
    renderWithProviders(<CreatePostModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Create Post")).toBeDefined();
    expect(screen.getByPlaceholderText("Start a discussion on FOZ...")).toBeDefined();
  });

  it("should display attached image preview with visible remove button and allow removing image", async () => {
    renderWithProviders(<CreatePostModal isOpen={true} onClose={mockOnClose} />);

    // Find file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    // Create a mock image File
    const file = new File(["fake image content"], "photo.png", { type: "image/png" });

    // Upload file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify image preview is displayed
    const previewImg = await screen.findByAltText("attachment");
    expect(previewImg).toBeDefined();

    // Verify the remove button (X icon) is visible and accessible
    const removeBtn = screen.getByLabelText("Remove attachment");
    expect(removeBtn).toBeDefined();
    expect(removeBtn.className).toContain("opacity-100");

    // Click remove button
    fireEvent.click(removeBtn);

    // Verify preview and remove button are removed
    await waitFor(() => {
      expect(screen.queryByAltText("attachment")).toBeNull();
      expect(screen.queryByLabelText("Remove attachment")).toBeNull();
    });
  });
});
