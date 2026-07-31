import { describe, it, expect } from "vitest";
import { DefaultAISummarizerProvider } from "#backend/services/ai-summarizer.js";

describe("DefaultAISummarizerProvider", () => {
  const provider = new DefaultAISummarizerProvider();

  it("generates a structured summary output from post content and comments", async () => {
    const input = {
      postContent: "What is the best way to handle asynchronous background tasks in Node.js?",
      comments: [
        { id: "c1", body: "Use BullMQ with Redis for robust message queues." },
        { id: "c2", body: "Worker threads work well for CPU heavy workloads." },
        { id: "c3", body: "Avoid blocking the main event loop at all costs." },
      ],
    };

    const output = await provider.generateSummary(input);

    expect(output).toHaveProperty("postSnapshot");
    expect(output).toHaveProperty("keyHighlights");
    expect(output).toHaveProperty("sentiment");
    expect(Array.isArray(output.keyHighlights)).toBe(true);
    expect(output.keyHighlights.length).toBeGreaterThan(0);
  });

  it("handles empty comments gracefully", async () => {
    const input = {
      postContent: "A post with no comments.",
      comments: [],
    };

    const output = await provider.generateSummary(input);

    expect(output.postSnapshot).toBeDefined();
    expect(output.keyHighlights).toBeDefined();
    expect(output.sentiment).toBeDefined();
  });
});
