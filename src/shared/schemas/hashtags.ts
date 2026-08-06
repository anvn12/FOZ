import { z } from "zod";

export const HashtagItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  postCount: z.number().int().nonnegative(),
});

export type HashtagItem = z.infer<typeof HashtagItemSchema>;

export const TrendingHashtagsResponseSchema = z.object({
  items: z.array(HashtagItemSchema),
});

export type TrendingHashtagsResponse = z.infer<typeof TrendingHashtagsResponseSchema>;
