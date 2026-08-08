import { describe, it, expect } from "vitest";
import { getSampledCommentsForSummary } from "#backend/db/repositories/post-summary.repository.js";

describe("post-summary.repository", () => {
  it("exports getSampledCommentsForSummary function", () => {
    expect(typeof getSampledCommentsForSummary).toBe("function");
  });
});
