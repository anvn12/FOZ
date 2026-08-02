import { describe, expect, it } from "vitest";
import { getOptimizedCloudinaryUrl } from "../cloudinary.js";

describe("getOptimizedCloudinaryUrl", () => {
  it("injects f_auto,q_auto into Cloudinary URL", () => {
    const rawUrl = "https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg";
    const optimized = getOptimizedCloudinaryUrl(rawUrl, { width: 800 });
    expect(optimized).toBe("https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v1600000000/sample.jpg");
  });

  it("returns non-Cloudinary URL untouched", () => {
    const nonCloudinaryUrl = "https://example.com/images/avatar.jpg";
    expect(getOptimizedCloudinaryUrl(nonCloudinaryUrl)).toBe(nonCloudinaryUrl);
  });
});
