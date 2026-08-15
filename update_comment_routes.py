import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\src\backend\api\comments\routes.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for createReport and createReportRequestSchema
import_old = """import { createCommentRequestSchema, updateCommentRequestSchema } from "#shared/schemas/interactions.js";
import { createComment, updateCommentBody, deleteComment, listComments, listAuthorComments } from "#backend/services/interactions/comments.js";"""
import_new = """import { createCommentRequestSchema, updateCommentRequestSchema, createReportRequestSchema } from "#shared/schemas/interactions.js";
import { createComment, updateCommentBody, deleteComment, listComments, listAuthorComments } from "#backend/services/interactions/comments.js";
import { createReport } from "#backend/services/interactions/reports.js";"""

content = content.replace(import_old, import_new)

# Add route at the end of the file
route_addition = """

commentRouter.post(
  "/comments/:commentId/report",
  requireAuth,
  validateBody(createReportRequestSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      const commentId = req.params.commentId as string;
      const report = await createReport(req.user.id, "comment", commentId, req.body.reasonType, req.body.details);
      return res.status(201).json(report);
    } catch (err) {
      if (err instanceof Error && err.message === "COMMENT_NOT_FOUND") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Comment not found" } });
      }
      next(err);
    }
  }
);
"""

content += route_addition

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated comments routes")
