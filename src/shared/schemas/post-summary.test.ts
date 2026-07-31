import { describe, it, expect } from "vitest";
import { postSummarySchema, postSummaryResponseSchema } from "./post-summary.js";

describe("postSummarySchema", () => {
  it("validates a complete post summary object", () => {
    const validData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      postId: "98765432-e89b-12d3-a456-426614174000",
      postSnapshot: "This is a summary of the main post topic.",
      keyHighlights: ["Highlight 1", "Highlight 2"],
      sentiment: "Positive",
      commentCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = postSummarySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const invalidData = {
      id: "invalid-uuid",
      postSnapshot: "Missing postId and id format is bad",
    };

    const result = postSummarySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("validates postSummaryResponseSchema correctly", () => {
    const responseData = {
      success: true,
      cached: false,
      summary: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        postId: "98765432-e89b-12d3-a456-426614174000",
        postSnapshot: "Main post summary",
        keyHighlights: ["Key point"],
        sentiment: "Neutral",
        commentCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const result = postSummaryResponseSchema.safeParse(responseData);
    expect(result.success).toBe(true);
  });
});
