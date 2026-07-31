import { z } from "zod";

export const postSummarySchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  postSnapshot: z.string(),
  keyHighlights: z.array(z.string()),
  sentiment: z.string(),
  commentCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PostSummaryDTO = z.infer<typeof postSummarySchema>;

export const postSummaryResponseSchema = z.object({
  success: z.boolean(),
  summary: postSummarySchema,
  cached: z.boolean(),
});

export type PostSummaryResponse = z.infer<typeof postSummaryResponseSchema>;
