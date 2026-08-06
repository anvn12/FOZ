import { z } from "zod";

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
});

export const SearchDiscoveryResponseSchema = z.object({
  topics: z.array(DiscoveryTopicSchema),
  creators: z.array(DiscoveryCreatorSchema),
  discussions: z.array(DiscoveryDiscussionSchema),
});

export type SearchDiscoveryQuery = z.infer<typeof SearchDiscoveryQuerySchema>;
export type DiscoveryTopic = z.infer<typeof DiscoveryTopicSchema>;
export type DiscoveryCreator = z.infer<typeof DiscoveryCreatorSchema>;
export type DiscoveryDiscussion = z.infer<typeof DiscoveryDiscussionSchema>;
export type SearchDiscoveryResponse = z.infer<typeof SearchDiscoveryResponseSchema>;
