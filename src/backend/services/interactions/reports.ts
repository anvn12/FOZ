import { eq, and } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { posts, comments, reports } from "#backend/db/schema/interactions.js";

export async function createReport(
  reporterId: string,
  targetType: "post" | "comment" | "user",
  targetId: string,
  reasonType: string,
  details?: string
) {
  // Validate target exists
  if (targetType === "post") {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, targetId)
    });
    if (!post) {
      throw new Error("POST_NOT_FOUND");
    }
  } else if (targetType === "comment") {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, targetId)
    });
    if (!comment) {
      throw new Error("COMMENT_NOT_FOUND");
    }
  }
  // User targets omitted for now based on spec focus.

  const [report] = await db.insert(reports).values({
    reporterId,
    targetType,
    targetId,
    reasonType: reasonType as any,
    details,
  }).returning();

  return report;
}
