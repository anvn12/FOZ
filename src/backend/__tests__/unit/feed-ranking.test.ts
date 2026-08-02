import { describe, it, expect } from "vitest";
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
