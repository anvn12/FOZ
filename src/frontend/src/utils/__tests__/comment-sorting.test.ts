import { describe, it, expect } from "vitest";
import {
  commentRecencyScore,
  commentEngagementScore,
  scoreComment,
  sortComments,
  type CommentSortableItem,
} from "../comment-sorting";

function makeComment(overrides: Partial<CommentSortableItem> = {}): CommentSortableItem {
  return {
    id: "comment-1",
    createdAt: new Date(Date.now() - 3600_000), // 1 hour ago
    likeCount: 0,
    replyCount: 0,
    ...overrides,
  };
}

describe("commentRecencyScore", () => {
  it("returns ~1 for a comment created just now", () => {
    const score = commentRecencyScore(new Date());
    expect(score).toBeGreaterThan(0.99);
  });

  it("returns ~0.5 at 48 hours", () => {
    const score = commentRecencyScore(new Date(Date.now() - 48 * 3600_000));
    expect(score).toBeCloseTo(0.5, 1);
  });
});

describe("commentEngagementScore", () => {
  it("returns 0 for no engagement", () => {
    expect(commentEngagementScore(0, 0)).toBe(0);
  });

  it("combines likeCount and replyCount", () => {
    expect(commentEngagementScore(10, 5)).toBe(0.15);
  });

  it("caps at 1.0", () => {
    expect(commentEngagementScore(100, 50)).toBe(1.0);
  });
});

describe("scoreComment", () => {
  it("higher engagement scores higher than lower engagement with same age", () => {
    const lowEng = makeComment({ id: "c1", likeCount: 1, replyCount: 0 });
    const highEng = makeComment({ id: "c2", likeCount: 20, replyCount: 5 });
    expect(scoreComment(highEng)).toBeGreaterThan(scoreComment(lowEng));
  });

  it("newer comment scores higher than older comment with same engagement", () => {
    const newComment = makeComment({ id: "c1", createdAt: new Date() });
    const oldComment = makeComment({ id: "c2", createdAt: new Date(Date.now() - 7 * 24 * 3600_000) });
    expect(scoreComment(newComment)).toBeGreaterThan(scoreComment(oldComment));
  });
});

describe("sortComments", () => {
  it("sorts by recent (newest first)", () => {
    const c1 = makeComment({ id: "c1", createdAt: new Date(Date.now() - 3600_000) });
    const c2 = makeComment({ id: "c2", createdAt: new Date(Date.now() - 100) });
    const c3 = makeComment({ id: "c3", createdAt: new Date(Date.now() - 7200_000) });

    const sorted = sortComments([c1, c2, c3], "recent");
    expect(sorted.map((c) => c.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("sorts by top (ranking score descending: engagement + recency)", () => {
    const oldPopular = makeComment({
      id: "old-popular",
      createdAt: new Date(Date.now() - 2 * 3600_000),
      likeCount: 50,
      replyCount: 10,
    });
    const brandNewLow = makeComment({
      id: "brand-new-low",
      createdAt: new Date(),
      likeCount: 0,
      replyCount: 0,
    });
    const oldNoEng = makeComment({
      id: "old-no-eng",
      createdAt: new Date(Date.now() - 24 * 3600_000),
      likeCount: 0,
      replyCount: 0,
    });

    const sorted = sortComments([brandNewLow, oldNoEng, oldPopular], "top");
    expect(sorted[0]!.id).toBe("old-popular");
    expect(sorted[sorted.length - 1]!.id).toBe("old-no-eng");
  });
});
