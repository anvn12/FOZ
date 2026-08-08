import { describe, it, expect } from "vitest";
import { DefaultAISummarizerProvider } from "#backend/services/ai-summarizer.js";

describe("Post Summary Fallbacks & Short Threads", () => {
  const provider = new DefaultAISummarizerProvider();

  it("handles a post with 0 comments", async () => {
    const output = await provider.generateSummary({
      postContent: "This post has zero comments.",
      comments: [],
    });

    expect(output.postSnapshot).toBe("This post has zero comments.");
    expect(output.keyHighlights).toContain("No community comments provided yet.");
  });

  it("handles a post with fewer than 10 comments", async () => {
    const output = await provider.generateSummary({
      postContent: "Post with 2 comments.",
      comments: [
        { id: "1", body: "First comment" },
        { id: "2", body: "Second comment" },
      ],
    });

    expect(output.postSnapshot).toBeDefined();
    expect(output.keyHighlights.length).toBeGreaterThan(0);
  });
});
