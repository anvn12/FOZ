import { z } from "zod";
import { postAttachmentResponseSchema } from "./interactions.js";

export const SearchDiscoveryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

export const DiscoveryTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string(),
  postCount: z.number().optional(),
});

export const DiscoveryCreatorSchema = z.object({
  id: z.string(),
  userAccountId: z.string(),
  username: z.string().optional(),
  displayName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const DiscoveryDiscussionSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorHandle: z.string(),
  authorAvatarUrl: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
  likeCount: z.number(),
  commentCount: z.number(),
  repostCount: z.number(),
  attachments: z.array(postAttachmentResponseSchema),
});

export const SearchDiscoveryResponseSchema = z.object({
  topics: z.array(DiscoveryTopicSchema),
  creators: z.array(DiscoveryCreatorSchema),
  discussions: z.array(DiscoveryDiscussionSchema),
});

export const SearchPostItemSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorUsername: z.string().nullable().optional(),
  authorAvatarUrl: z.string().nullable(),
  body: z.string().nullable(),
  content: z.string().nullable(),
  visibilityState: z.enum(["public", "hidden"]),
  lifecycleState: z.string(),
  createdAt: z.string(),
  type: z.literal("post"),
});

export const SearchUserItemSchema = z.object({
  id: z.string().uuid(),
  userAccountId: z.string().uuid(),
  profileId: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  location: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: z.string(),
  type: z.literal("user"),
});

export const SearchHashtagItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  postCount: z.number().int().nonnegative(),
  type: z.literal("hashtag"),
});

export const SearchResponseSchema = z.object({
  items: z.array(
    z.discriminatedUnion("type", [
      SearchPostItemSchema,
      SearchUserItemSchema,
      SearchHashtagItemSchema,
    ])
  ),
  nextCursor: z.string().nullable(),
});

export type SearchDiscoveryQuery = z.infer<typeof SearchDiscoveryQuerySchema>;
export type DiscoveryTopic = z.infer<typeof DiscoveryTopicSchema>;
export type DiscoveryCreator = z.infer<typeof DiscoveryCreatorSchema>;
export type DiscoveryDiscussion = z.infer<typeof DiscoveryDiscussionSchema>;
export type SearchDiscoveryResponse = z.infer<typeof SearchDiscoveryResponseSchema>;
export type SearchPostItem = z.infer<typeof SearchPostItemSchema>;
export type SearchUserItem = z.infer<typeof SearchUserItemSchema>;
export type SearchHashtagItem = z.infer<typeof SearchHashtagItemSchema>;
export type SearchItem = z.infer<typeof SearchResponseSchema>["items"][number];
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
