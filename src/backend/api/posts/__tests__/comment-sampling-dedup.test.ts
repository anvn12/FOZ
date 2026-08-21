import { describe, it, expect } from "vitest";
import { sampleCommentsForSummary } from "#backend/services/post-summary.service.js";

describe("Comment Sampling & Deduplication Algorithm (sampleCommentsForSummary)", () => {
  it("Extracts 10 unique comments following the 4:3:3 priority ratio without duplicate items", () => {
    // 15 comments created with decreasing timestamps
    const now = Date.now();
    const comments = Array.from({ length: 15 }, (_, i) => ({
      id: `c${i + 1}`,
      body: `Comment body ${i + 1}`,
      createdAt: new Date(now - i * 60000).toISOString(),
    }));

    // c1 and c2 are BOTH top-liked and top-replied
    const likesMap = new Map<string, number>([
      ["c1", 50],
      ["c2", 40],
      ["c3", 30],
      ["c4", 20],
      ["c15", 10],
    ]);

    const repliesMap = new Map<string, number>([
      ["c1", 100], // Should be deduplicated (already in top liked)
      ["c2", 80],  // Should be deduplicated (already in top liked)
      ["c5", 60],
      ["c6", 40],
      ["c7", 20],
    ]);

    const sampled = sampleCommentsForSummary(comments, likesMap, repliesMap);

    // Verify exactly 10 comments returned
    expect(sampled).toHaveLength(10);

    const sampledIds = sampled.map((c) => c.id);

    // Verify 100% uniqueness (no duplicate IDs)
    expect(new Set(sampledIds).size).toBe(10);

    // Bucket 1 (4 Most Liked): c1, c2, c3, c4
    expect(sampledIds.slice(0, 4)).toEqual(["c1", "c2", "c3", "c4"]);

    // Bucket 2 (3 Most Replied, skipping c1 & c2): c5, c6, c7
    expect(sampledIds.slice(4, 7)).toEqual(["c5", "c6", "c7"]);

    // Bucket 3 (3 Most Recent not already selected): c8, c9, c10 (since c1..c7 already selected)
    expect(sampledIds.slice(7, 10)).toEqual(["c8", "c9", "c10"]);
  });

  it("Defaults smoothly to timestamp ordering (10 newest comments) when thread has 0 engagement (0 likes, 0 replies)", () => {
    const now = Date.now();
    const comments = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i + 1}`,
      body: `Zero engagement comment ${i + 1}`,
      createdAt: new Date(now - i * 1000).toISOString(),
    }));

    const emptyLikes = new Map<string, number>();
    const emptyReplies = new Map<string, number>();

    const sampled = sampleCommentsForSummary(comments, emptyLikes, emptyReplies);

    expect(sampled).toHaveLength(10);
    expect(new Set(sampled.map((c) => c.id)).size).toBe(10);
    // Should contain the first 10 comments in chronological order (c1 to c10)
    expect(sampled.map((c) => c.id)).toEqual([
      "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"
    ]);
  });

  it("Returns all available comments without index errors when thread has fewer than 10 comments", () => {
    const comments = [
      { id: "c1", body: "First comment", createdAt: new Date().toISOString() },
      { id: "c2", body: "Second comment", createdAt: new Date().toISOString() },
      { id: "c3", body: "Third comment", createdAt: new Date().toISOString() },
    ];

    const sampled = sampleCommentsForSummary(comments);

    expect(sampled).toHaveLength(3);
    expect(sampled.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("Returns an empty array when comments list is empty", () => {
    const sampled = sampleCommentsForSummary([]);
    expect(sampled).toEqual([]);
  });
});
