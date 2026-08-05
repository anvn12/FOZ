// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommentEditor } from "../comment/CommentEditor.js";
import * as deviceUtils from "#frontend/utils/device";

describe("CommentEditor Component", () => {
  it("calls onSave when pressing Enter without Shift on desktop", () => {
    vi.spyOn(deviceUtils, "isMobileDevice").mockReturnValue(false);
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleChange = vi.fn();

    render(
      <CommentEditor
        value="Hello world"
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("does not call onSave when pressing Enter on mobile screen/device", () => {
    vi.spyOn(deviceUtils, "isMobileDevice").mockReturnValue(true);
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleChange = vi.fn();

    render(
      <CommentEditor
        value="Hello world"
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(handleSave).not.toHaveBeenCalled();
  });

  it("does not call onSave when pressing Shift + Enter", () => {
    vi.spyOn(deviceUtils, "isMobileDevice").mockReturnValue(false);
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleChange = vi.fn();

    render(
      <CommentEditor
        value="Hello world"
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(handleSave).not.toHaveBeenCalled();
  });
});
