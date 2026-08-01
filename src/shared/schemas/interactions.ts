import { z } from "zod";

const trimmedText = z.string().trim().min(1, "Content cannot be empty").max(5000, "Content is too long");

export const postIdSchema = z.string().uuid();
export const commentIdSchema = z.string().uuid();
export const reactionTargetTypeSchema = z.enum(["post", "comment"]);

export const attachmentSchema = z.object({
  fileUrl: z.string(),
  fileType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSize: z.number().int().max(5 * 1024 * 1024, "File size exceeds 5MB limit"),
});

export const singlePostInputSchema = z.object({
  content: z.string().trim().max(5000, "Content is too long").optional(),
  parentId: postIdSchema.optional(),
  repostOfId: postIdSchema.optional(),
  attachments: z.array(attachmentSchema).max(4, "Maximum 4 attachments allowed").optional(),
}).refine(data => data.content || (data.attachments && data.attachments.length > 0) || data.repostOfId, {
  message: "Post must have either content, attachments, or be a repost",
});

export const createPostRequestSchema = z.union([
  singlePostInputSchema,
  z.object({
    posts: z.array(singlePostInputSchema).min(1).max(10)
  })
]);

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;

export const updatePostRequestSchema = z.object({
  content: trimmedText,
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

import { reportReasonTypes } from "../schema-enums.js";

export const createReportRequestSchema = z.object({
  reasonType: z.enum(reportReasonTypes),
  details: z.string().trim().max(1000, "Details are too long").optional(),
});
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const reactionResponseSchema = z.object({
  active: z.boolean(),
  targetType: reactionTargetTypeSchema,
  targetId: z.string().uuid(),
  likeCount: z.number().int().nonnegative(),
});
export type ReactionResponse = z.infer<typeof reactionResponseSchema>;

export const postAttachmentResponseSchema = z.object({
  id: z.string().uuid(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number().int(),
});

export const postResponseSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string().nullable(),
  parentId: z.string().uuid().nullable(),
  repostOfId: z.string().uuid().nullable().optional(),
  repostId: z.string().uuid().optional(),
  repostedBy: z.object({
    id: z.string().uuid(),
    displayName: z.string()
  }).optional(),
  reposted: z.boolean().optional(),
  commentCount: z.number().int().nonnegative().optional(),
  visibilityState: z.enum(["public", "hidden"]),
  lifecycleState: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  attachments: z.array(postAttachmentResponseSchema).optional(),
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
  replyCount: z.number().int().nonnegative().optional(),
});
export type CommentResponse = z.infer<typeof commentResponseSchema>;