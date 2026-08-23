import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  recencyScore,
  engagementScore,
  scorePost,
  rankPosts,
  buildViewerInteractionMap,
  type RankedPost,
} from "#backend/services/interactions/feed-ranking.js";

function makePost(overrides: Partial<RankedPost> = {}): RankedPost {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    authorId: "00000000-0000-0000-0000-000000000010",
    createdAt: new Date(Date.now() - 3600_000), // 1 hour ago
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
    ...overrides,
  };
}

describe("recencyScore", () => {
  it("returns ~1 for a post just created", () => {
    const score = recencyScore(new Date());
    expect(score).toBeGreaterThan(0.99);
  });

  it("returns ~0.5 at HALF_LIFE_HOURS (48h)", () => {
    const score = recencyScore(new Date(Date.now() - 48 * 3600_000));
    expect(score).toBeCloseTo(0.5, 1);
  });

  it("decays toward 0 for old posts", () => {
    const score = recencyScore(new Date(Date.now() - 30 * 24 * 3600_000)); // 30 days
    expect(score).toBeLessThan(0.1);
  });
});

describe("engagementScore", () => {
  it("returns 0 for no engagement", () => {
    expect(engagementScore(0, 0, 0)).toBe(0);
  });

  it("returns 1.0 when total hits cap (100)", () => {
    expect(engagementScore(50, 30, 20)).toBe(1);
  });

  it("caps at 1.0 even beyond 100", () => {
    expect(engagementScore(200, 200, 200)).toBe(1);
  });

  it("scales linearly below cap", () => {
    expect(engagementScore(10, 20, 20)).toBeCloseTo(0.5, 2);
  });
});

describe("scorePost", () => {
  it("cold start: affinity is 0, score = engagement + recency", () => {
    const post = makePost({ likeCount: 10, commentCount: 5 });
    const score = scorePost(post, new Map());
    // engagement = min(15, 100)/100 = 0.15, recency ≈ 0.98
    // score = 0 + 0.15*0.3 + 0.98*0.2 = 0.045 + 0.196 = 0.241
    expect(score).toBeGreaterThan(0.2);
    expect(score).toBeLessThan(0.3);
  });

  it("affinity boost: viewer interacted with author scores higher", () => {
    const post = makePost({ authorId: "author-A", likeCount: 5 });
    const interactions = new Map([["author-A", 10]]);
    const withAffinity = scorePost(post, interactions);
    const withoutAffinity = scorePost(post, new Map());
    expect(withAffinity).toBeGreaterThan(withoutAffinity);
  });

  it("newer post scores higher than older with same engagement", () => {
    const newPost = makePost({ createdAt: new Date(), likeCount: 5 });
    const oldPost = makePost({ createdAt: new Date(Date.now() - 7 * 24 * 3600_000), likeCount: 5 });
    expect(scorePost(newPost, new Map())).toBeGreaterThan(scorePost(oldPost, new Map()));
  });

  describe("exact-value regression (fixed inputs, frozen clock)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("computes a precise score for fixed likes/comments/affinity/age", () => {
      const post = makePost({
        authorId: "author-fixed",
        createdAt: new Date("2025-12-31T00:00:00Z"), // exactly 24h before frozen "now"
        likeCount: 10,
        commentCount: 5,
        repostCount: 0,
      });
      const score = scorePost(post, new Map([["author-fixed", 2]]));
      // affinity = 2 * 0.5 = 1.0
      // engagement = min(15, 100)/100 = 0.15 -> * 0.3 = 0.045
      // recency = 1 / (1 + 24/48) = 0.6666... -> * 0.2 = 0.13333...
      // total = 1.0 + 0.045 + 0.133333... = 1.178333...
      expect(score).toBeCloseTo(1.178333, 5);
    });
  });

  it("affinity has no upper cap, unlike engagement (documents current behavior)", () => {
    // engagementScore is explicitly capped at 1.0 (Math.min(raw, 100) / 100), but
    // affinity is `rawInteractionCount * W_AFFINITY` with no equivalent cap. A viewer
    // with a long interaction history with one author can score that author's posts
    // far above anything engagement + recency alone could ever produce (max 0.3 + 0.2
    // = 0.5). This test locks in that behavior so a future change to either formula
    // is a deliberate choice, not a silent regression.
    const post = makePost({ authorId: "prolific-author", likeCount: 0, commentCount: 0 });
    const heavyInteractions = new Map([["prolific-author", 50]]);
    const score = scorePost(post, heavyInteractions);
    // affinity alone = 50 * 0.5 = 25, dwarfing the 0.5 max of engagement + recency.
    expect(score).toBeGreaterThan(20);
  });
});

describe("rankPosts", () => {
  it("sorts posts by score descending", () => {
    const posts = [
      makePost({ id: "p1", createdAt: new Date(Date.now() - 7 * 24 * 3600_000), likeCount: 0 }),
      makePost({ id: "p2", createdAt: new Date(), likeCount: 20 }),
      makePost({ id: "p3", createdAt: new Date(Date.now() - 3600_000), likeCount: 5 }),
    ];
    const ranked = rankPosts(posts, new Map());
    expect(ranked[0]!.id).toBe("p2");
  });

  it("returns empty array for empty input", () => {
    expect(rankPosts([], new Map())).toEqual([]);
  });
});

describe("buildViewerInteractionMap", () => {
  it("counts reactions per author", () => {
    const postAuthorMap = new Map([["post-1", "author-A"], ["post-2", "author-B"]]);
    const reactions = [{ targetType: "post", targetId: "post-1" }, { targetType: "post", targetId: "post-1" }];
    const map = buildViewerInteractionMap(reactions, [], postAuthorMap);
    expect(map.get("author-A")).toBe(2);
    expect(map.get("author-B")).toBeUndefined();
  });

  it("combines reactions and comments", () => {
    const postAuthorMap = new Map([["post-1", "author-A"]]);
    const reactions = [{ targetType: "post", targetId: "post-1" }];
    const comments = [{ postId: "post-1" }, { postId: "post-1" }];
    const map = buildViewerInteractionMap(reactions, comments, postAuthorMap);
    expect(map.get("author-A")).toBe(3);
  });

  it("returns empty map for no interactions", () => {
    expect(buildViewerInteractionMap([], [], new Map()).size).toBe(0);
  });
});
