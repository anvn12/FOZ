// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageUploader } from "../ImageUploader.js";

describe("ImageUploader Component", () => {
  it("renders upload button with label and file input", () => {
    render(<ImageUploader label="Upload Photo" />);

    const button = screen.getByRole("button", { name: "Upload Photo" });
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Upload Photo");

    const fileInput = screen.getByTestId("image-input");
    expect(fileInput).toBeDefined();
    expect(fileInput.getAttribute("accept")).toBe("image/jpeg,image/png,image/webp,image/heic");
  });
});
