import { z } from "zod";

const trimmedText = z.string().trim().min(1, "Content cannot be empty").max(5000, "Content is too long");

export const postIdSchema = z.string().uuid();
export const commentIdSchema = z.string().uuid();
export const reactionTargetTypeSchema = z.enum(["post", "comment"]);

export const createPostRequestSchema = z.object({
  body: trimmedText,
});
export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;

export const updatePostRequestSchema = z.object({
  body: trimmedText,
});
export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;

export const createCommentRequestSchema = z.object({
  body: trimmedText,
  parentCommentId: commentIdSchema.optional(),
});
export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;

export const updateCommentRequestSchema = z.object({
  body: trimmedText,
});
export type UpdateCommentRequest = z.infer<typeof updateCommentRequestSchema>;

export const reactionResponseSchema = z.object({
  active: z.boolean(),
  targetType: reactionTargetTypeSchema,
  targetId: z.string().uuid(),
  likeCount: z.number().int().nonnegative(),
});
export type ReactionResponse = z.infer<typeof reactionResponseSchema>;

export const postResponseSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string(),
  visibilityState: z.enum(["public", "hidden"]),
  lifecycleState: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type PostResponse = z.infer<typeof postResponseSchema>;

export const commentResponseSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid().nullable(),
  authorId: z.string().uuid(),
  body: z.string(),
  visibilityState: z.enum(["public", "hidden"]),
  lifecycleState: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type CommentResponse = z.infer<typeof commentResponseSchema>;