// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpandableText } from "../ExpandableText.js";

describe("ExpandableText Component", () => {
  it("renders short text without Read more button", () => {
    render(<ExpandableText text="Short post text" maxLength={100} />);
    expect(screen.getByText("Short post text")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("truncates long text and shows Read more button when text exceeds maxLength", () => {
    const longText = "A ".repeat(200); // 400 chars
    render(<ExpandableText text={longText} maxLength={100} />);

    const readMoreBtn = screen.getByRole("button", { name: "Read more" });
    expect(readMoreBtn).toBeDefined();
    expect(screen.queryByText(longText)).toBeNull();
  });

  it("truncates long text and shows Read more button when lines exceed maxLines", () => {
    const multiLineText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6";
    render(<ExpandableText text={multiLineText} maxLines={3} />);

    const readMoreBtn = screen.getByRole("button", { name: "Read more" });
    expect(readMoreBtn).toBeDefined();
  });

  it("expands to full text when Read more is clicked and collapses when Show less is clicked", () => {
    const longText =
      "This is a very long post that exceeds the maximum length limit set for the expandable text component. " +
      "Extra words. ".repeat(10);
    render(<ExpandableText text={longText} maxLength={50} />);

    const readMoreBtn = screen.getByRole("button", { name: "Read more" });
    expect(readMoreBtn).toBeDefined();

    fireEvent.click(readMoreBtn);

    const showLessBtn = screen.getByRole("button", { name: "Show less" });
    expect(showLessBtn).toBeDefined();

    fireEvent.click(showLessBtn);

    expect(screen.getByRole("button", { name: "Read more" })).toBeDefined();
  });

  it("stops event propagation when clicking Read more button", () => {
    const parentClick = vi.fn();
    const longText = "B ".repeat(200);

    render(
      <div onClick={parentClick}>
        <ExpandableText text={longText} maxLength={100} />
      </div>,
    );

    const readMoreBtn = screen.getByRole("button", { name: "Read more" });
    fireEvent.click(readMoreBtn);

    expect(parentClick).not.toHaveBeenCalled();
  });

  it("adds break-words so long unbroken strings wrap instead of overflowing", () => {
    // Regression for issue #192: a single line with >240 chars (e.g. 300 'a's)
    // must wrap (break-words) and reveal the full text after expanding.
    const unbroken = "a".repeat(300);
    render(<ExpandableText text={unbroken} maxLength={240} maxLines={4} />);

    // The collapsed preview must contain the word-break utility so the
    // unbroken string wraps within the container instead of overflowing.
    const container = screen.getByText(/a+\.\.\./).closest("div");
    expect(container?.className).toContain("break-words");

    // Expanding must render the full 300-char string.
    fireEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(screen.getByText(unbroken)).toBeDefined();
  });
});
