import { describe, expect, it } from "vitest";
import { validateImageFile } from "../imageCompressor";


describe("imageCompressor utility", () => {
  it("validates supported MIME types correctly", () => {
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    const result = validateImageFile(validFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects unsupported MIME types", () => {
    const invalidFile = new File(["dummy"], "document.pdf", { type: "application/pdf" });
    const result = validateImageFile(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unsupported image format");
  });

  it("rejects raw files exceeding 25MB limit", () => {
    const oversizedFile = new File([new ArrayBuffer(26 * 1024 * 1024)], "huge.png", {
      type: "image/png",
    });
    const result = validateImageFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds maximum raw size limit");
  });
});
