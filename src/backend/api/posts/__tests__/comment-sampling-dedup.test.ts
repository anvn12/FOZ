import { describe, it, expect } from "vitest";

describe("Comment Sampling Deduplication Algorithm", () => {
  it("deduplicates comments across Most Liked, Most Replied, and Most Recent buckets", () => {
    const comments = Array.from({ length: 15 }, (_, i) => ({
      id: `c${i + 1}`,
      body: `Comment ${i + 1}`,
      createdAt: new Date(Date.now() - i * 1000).toISOString(),
    }));

    const likesMap = new Map<string, number>([
      ["c1", 10], ["c2", 8], ["c3", 6], ["c4", 5],
    ]);

    const repliesMap = new Map<string, number>([
      ["c1", 20], // Also top liked!
      ["c2", 15], // Also top liked!
      ["c5", 12],
      ["c6", 10],
      ["c7", 8],
    ]);

    const selectedSet = new Set<string>();
    const sampled: string[] = [];

    // Bucket 1: 4 Most Liked
    const sortedByLikes = [...comments].sort((a, b) => (likesMap.get(b.id) || 0) - (likesMap.get(a.id) || 0));
    for (const c of sortedByLikes) {
      if (sampled.length >= 4) break;
      if (!selectedSet.has(c.id)) {
        selectedSet.add(c.id);
        sampled.push(c.id);
      }
    }

    expect(sampled).toEqual(["c1", "c2", "c3", "c4"]);

    // Bucket 2: 3 Most Replied (skips c1, c2 because they are already selected)
    const sortedByReplies = [...comments].sort((a, b) => (repliesMap.get(b.id) || 0) - (repliesMap.get(a.id) || 0));
    for (const c of sortedByReplies) {
      if (sampled.length >= 7) break;
      if (!selectedSet.has(c.id)) {
        selectedSet.add(c.id);
        sampled.push(c.id);
      }
    }

    expect(sampled).toEqual(["c1", "c2", "c3", "c4", "c5", "c6", "c7"]);

    // Bucket 3: 3 Most Recent
    const sortedByRecent = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    for (const c of sortedByRecent) {
      if (sampled.length >= 10) break;
      if (!selectedSet.has(c.id)) {
        selectedSet.add(c.id);
        sampled.push(c.id);
      }
    }

    expect(sampled.length).toBe(10);
    expect(new Set(sampled).size).toBe(10); // 100% unique!
  });
});
