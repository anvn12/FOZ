import { getPostById } from "#backend/db/repositories/interactions.js";
import { getPostSummaryByPostId, getSampledCommentsForSummary, upsertPostSummary } from "#backend/db/repositories/post-summary.repository.js";
import { aiSummarizer } from "#backend/services/ai-summarizer.js";

export interface CommentCandidate {
  id: string;
  body: string;
  createdAt: string | Date;
}

export function sampleCommentsForSummary(
  activeComments: CommentCandidate[],
  likeMap: Map<string, number> = new Map(),
  replyMap: Map<string, number> = new Map(),
): Array<{ id: string; body: string }> {
  if (activeComments.length <= 10) {
    return activeComments.map((c) => ({ id: c.id, body: c.body }));
  }

  const selectedSet = new Set<string>();
  const sampled: Array<{ id: string; body: string }> = [];

  // 1. Top 4 Most Liked
  const sortedByLikes = [...activeComments].sort(
    (a, b) => (likeMap.get(b.id) || 0) - (likeMap.get(a.id) || 0),
  );
  for (const c of sortedByLikes) {
    if (sampled.length >= 4) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  // 2. Top 3 Most Replied (direct 1st level)
  const sortedByReplies = [...activeComments].sort(
    (a, b) => (replyMap.get(b.id) || 0) - (replyMap.get(a.id) || 0),
  );
  for (const c of sortedByReplies) {
    if (sampled.length >= 7) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  // 3. Top 3 Most Recent
  const sortedByRecent = [...activeComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const c of sortedByRecent) {
    if (sampled.length >= 10) break;
    if (!selectedSet.has(c.id)) {
      selectedSet.add(c.id);
      sampled.push({ id: c.id, body: c.body });
    }
  }

  return sampled;
}

export async function getOrGeneratePostSummary(postId: string, forceRefresh = false) {
  const post = await getPostById(postId);
  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  if (!forceRefresh) {
    const cached = await getPostSummaryByPostId(postId);
    if (cached) {
      return { summary: cached, cached: true };
    }
  }

  const sampledComments = await getSampledCommentsForSummary(postId);
  const aiOutput = await aiSummarizer.generateSummary({
    postContent: post.content || "",
    comments: sampledComments,
  });

  const saved = await upsertPostSummary({
    postId,
    postSnapshot: aiOutput.postSnapshot,
    keyHighlights: aiOutput.keyHighlights,
    sentiment: aiOutput.sentiment,
    commentCount: sampledComments.length,
  });

  return { summary: saved, cached: false };
}
