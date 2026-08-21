import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DefaultAISummarizerProvider } from "#backend/services/ai-summarizer.js";

describe("DefaultAISummarizerProvider", () => {
  let provider: DefaultAISummarizerProvider;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    provider = new DefaultAISummarizerProvider();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("Heuristic Fallback Summaries", () => {
    it("Generates a structured summary for a standard post and comments", async () => {
      const input = {
        postContent: "What is the best way to handle asynchronous background tasks in Node.js?",
        comments: [
          { id: "c1", body: "Use BullMQ with Redis for robust message queues." },
          { id: "c2", body: "Worker threads work well for CPU heavy workloads." },
          { id: "c3", body: "Avoid blocking the main event loop at all costs." },
        ],
      };

      const output = await provider.generateSummary(input);

      expect(output.postSnapshot).toBe("What is the best way to handle asynchronous background tasks in Node.js?");
      expect(output.keyHighlights).toEqual([
        "Use BullMQ with Redis for robust message queues.",
        "Worker threads work well for CPU heavy workloads.",
        "Avoid blocking the main event loop at all costs.",
      ]);
      expect(output.sentiment).toBe("Active Community Discussion");
    });

    it("Returns default placeholder highlight and Neutral sentiment when comments list is empty", async () => {
      const input = {
        postContent: "A post with no comments.",
        comments: [],
      };

      const output = await provider.generateSummary(input);

      expect(output.postSnapshot).toBe("A post with no comments.");
      expect(output.keyHighlights).toEqual(["No community comments provided yet."]);
      expect(output.sentiment).toBe("Neutral");
    });

    it("Handles empty postContent gracefully by supplying standard placeholder snapshot", async () => {
      const input = {
        postContent: "   ",
        comments: [],
      };

      const output = await provider.generateSummary(input);

      expect(output.postSnapshot).toBe("The post discusses community ideas and feedback.");
      expect(output.keyHighlights).toEqual(["No community comments provided yet."]);
      expect(output.sentiment).toBe("Neutral");
    });

    it("Truncates long post body (>150 chars) and comment bodies (>100 chars) with ellipsis in fallback mode", async () => {
      const longPost = "A".repeat(160);
      const longComment = "B".repeat(120);

      const input = {
        postContent: longPost,
        comments: [{ id: "c1", body: longComment }],
      };

      const output = await provider.generateSummary(input);

      expect(output.postSnapshot).toBe("A".repeat(150) + "...");
      expect(output.keyHighlights[0]).toBe("B".repeat(100) + "...");
      expect(output.sentiment).toBe("Active Community Discussion");
    });

    it("Extracts and summarizes post containing image links cleanly", async () => {
      const input = {
        postContent: "Here is the architectural diagram https://example.com/diagram.png of the new system.",
        comments: [{ id: "c1", body: "Looks great!" }],
      };

      const output = await provider.generateSummary(input);

      expect(output.postSnapshot).toContain("Here is the architectural diagram");
      expect(output.keyHighlights).toEqual(["Looks great!"]);
    });
  });

  describe("LLM Provider Failover & Error Resilience", () => {
    it("Calls LLM endpoint and parses valid structured AI JSON response", async () => {
      process.env.GEMINI_API_KEY = "valid_test_api_key_123456";
      process.env.NODE_ENV = "development";

      const mockAiJson = JSON.stringify({
        postSnapshot: "Overview of Node.js background worker patterns.",
        keyHighlights: ["BullMQ is recommended", "Worker threads for CPU tasks"],
        sentiment: "Constructive",
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: mockAiJson }] } }],
        }),
      } as any);

      const output = await provider.generateSummary({
        postContent: "How to run background workers in Node.js?",
        comments: [{ id: "c1", body: "Use BullMQ" }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(output.postSnapshot).toBe("Overview of Node.js background worker patterns.");
      expect(output.keyHighlights).toEqual(["BullMQ is recommended", "Worker threads for CPU tasks"]);
      expect(output.sentiment).toBe("Constructive");
    });

    it("Fails on primary model with 503 and recovers by succeeding on fallback model in chain", async () => {
      process.env.GEMINI_API_KEY = "valid_test_api_key_123456";
      process.env.NODE_ENV = "development";

      const mockAiJson = JSON.stringify({
        postSnapshot: "Summary generated by fallback model.",
        keyHighlights: ["Fallback model succeeded"],
        sentiment: "Supportive",
      });

      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        // First model (gemini-2.5-flash) returns 503
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        } as any)
        // Second model (gemini-1.5-flash) succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: mockAiJson }] } }],
          }),
        } as any);

      const output = await provider.generateSummary({
        postContent: "Discussion topic",
        comments: [{ id: "c1", body: "Comment 1" }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(output.postSnapshot).toBe("Summary generated by fallback model.");
      expect(output.keyHighlights).toEqual(["Fallback model succeeded"]);
      expect(output.sentiment).toBe("Supportive");
    });

    it("Recovers gracefully with heuristic fallback summary when all LLM endpoints fail", async () => {
      process.env.GEMINI_API_KEY = "valid_test_api_key_123456";
      process.env.NODE_ENV = "development";

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
      } as any);

      const output = await provider.generateSummary({
        postContent: "All LLM APIs are down.",
        comments: [{ id: "c1", body: "Service outage fallback comment." }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(3); // Attempted all 3 models
      expect(output.postSnapshot).toBe("All LLM APIs are down.");
      expect(output.keyHighlights).toEqual(["Service outage fallback comment."]);
      expect(output.sentiment).toBe("Active Community Discussion");
    });

    it("Recovers gracefully when LLM returns malformed JSON", async () => {
      process.env.GEMINI_API_KEY = "valid_test_api_key_123456";
      process.env.NODE_ENV = "development";

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "THIS IS NOT VALID JSON { broken" }] } }],
        }),
      } as any);

      const output = await provider.generateSummary({
        postContent: "Post with broken LLM output",
        comments: [{ id: "c1", body: "Comment 1" }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(output.postSnapshot).toBe("Post with broken LLM output");
      expect(output.keyHighlights).toEqual(["Comment 1"]);
      expect(output.sentiment).toBe("Active Community Discussion");
    });
  });
});
