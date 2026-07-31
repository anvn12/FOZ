import { getPostById } from "#backend/db/repositories/interactions.js";
import { getPostSummaryByPostId, getSampledCommentsForSummary, upsertPostSummary } from "#backend/db/repositories/post-summary.repository.js";
import { aiSummarizer } from "#backend/services/ai-summarizer.js";

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
