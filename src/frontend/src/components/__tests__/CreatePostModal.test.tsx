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
  const toastMock = vi.fn() as any;
  toastMock.loading = vi.fn(() => "loading-toast-id");
  toastMock.success = vi.fn();
  toastMock.error = vi.fn();
  toastMock.dismiss = vi.fn();
  return {
    toast: toastMock,
    default: toastMock,
  };
});

vi.mock("../../api/upload.js", () => ({
  uploadMediaToCloudinary: vi.fn(),
}));

vi.mock("#frontend/utils/imageCompressor", async () => {
  const actual = (await vi.importActual("#frontend/utils/imageCompressor")) as any;
  return {
    ...actual,
    compressImageClient: vi.fn().mockResolvedValue({
      blob: new Blob(["fake webp"], { type: "image/webp" }),
      fileName: "photo.webp",
      width: 100,
      height: 100,
      originalSize: 1000,
      compressedSize: 500,
    }),
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

  it("shows offline error message when network error or timeout occurs during image upload", async () => {
    const { uploadMediaToCloudinary } = await import("../../api/upload.js");
    const { NetworkError } = await import("#frontend/api/network");
    const { toast } = await import("react-hot-toast");

    vi.mocked(uploadMediaToCloudinary).mockRejectedValue(new NetworkError());

    renderWithProviders(<CreatePostModal isOpen={true} onClose={mockOnClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["fake image content"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const postBtn = screen.getByRole("button", { name: "Post" });
    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You're offline. Check your connection and try again.",
        expect.objectContaining({ id: "offline-toast" }),
      );
      expect(screen.getByRole("button", { name: "Post" })).toBeDefined();
    });
  });
});
