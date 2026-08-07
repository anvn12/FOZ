// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";
import { ImageViewerModal } from "../ImageViewerModal.js";

describe("ImageViewerModal", () => {
  const images = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];
  const handleClose = vi.fn();

  it("renders the modal with full size image and controls", () => {
    render(<ImageViewerModal images={images} initialIndex={0} onClose={handleClose} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("1 / 2")).toBeDefined();

    const img = screen.getByAltText("Full size view 1") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/image1.jpg");
  });

  it("navigates next and previous images when clicking arrow buttons", () => {
    render(<ImageViewerModal images={images} initialIndex={0} onClose={handleClose} />);

    const nextBtn = screen.getByLabelText("Next image");
    fireEvent.click(nextBtn);

    expect(screen.getByText("2 / 2")).toBeDefined();
    expect((screen.getByAltText("Full size view 2") as HTMLImageElement).src).toBe("https://example.com/image2.jpg");

    const prevBtn = screen.getByLabelText("Previous image");
    fireEvent.click(prevBtn);

    expect(screen.getByText("1 / 2")).toBeDefined();
  });

  it("calls onClose when close button or Escape key is pressed", () => {
    render(<ImageViewerModal images={images} initialIndex={0} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText("Close image viewer");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
