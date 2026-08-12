// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedbackDialog, SUPPORT_EMAIL } from "../FeedbackDialog";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "react-hot-toast";

describe("FeedbackDialog Component", () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render anything when open is false", () => {
    const { container } = render(<FeedbackDialog open={false} onClose={onCloseMock} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render dialog title, email link, and guidance when open is true", () => {
    render(<FeedbackDialog open={true} onClose={onCloseMock} />);

    expect(screen.getByText("Send Us Feedback")).toBeDefined();
    expect(screen.getByText(SUPPORT_EMAIL)).toBeDefined();

    const mailtoLink = screen.getByRole("link", { name: new RegExp(SUPPORT_EMAIL) });
    expect(mailtoLink.getAttribute("href")).toContain(`mailto:${SUPPORT_EMAIL}`);
  });

  it("should call onClose when close button or backdrop is clicked", () => {
    render(<FeedbackDialog open={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByRole("button", { name: /close feedback dialog/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const dialogBackdrop = screen.getByRole("dialog");
    fireEvent.click(dialogBackdrop);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it("should call onClose when Escape key is pressed", () => {
    render(<FeedbackDialog open={true} onClose={onCloseMock} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should copy support email address and show toast when Copy Email button is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<FeedbackDialog open={true} onClose={onCloseMock} />);

    const copyBtn = screen.getByRole("button", { name: /copy email address/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(SUPPORT_EMAIL);
      expect(toast.success).toHaveBeenCalledWith("Email copied to clipboard!");
    });
  });
});
