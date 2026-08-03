import { describe, expect, it } from "vitest";
import { isCloudinaryConfigured, destroyAsset } from "../cloudinary.js";

describe("Cloudinary Service Unit Tests", () => {
  it("detects configuration status gracefully", () => {
    const configured = isCloudinaryConfigured();
    expect(typeof configured).toBe("boolean");
  });

  it("handles unconfigured service calls safely", async () => {
    if (!isCloudinaryConfigured()) {
      await expect(destroyAsset("test_id")).rejects.toThrow("Cloudinary credentials are not configured");
    }
  });
});
