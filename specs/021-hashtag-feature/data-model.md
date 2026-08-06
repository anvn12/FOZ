# Phase 1 Data Model: Hashtag Feature

## Database Entities (Drizzle ORM)

### `hashtags` Table
Stores unique hashtag records.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique hashtag ID |
| `name` | `text` | Unique, Not Null | Lowercase normalized tag name (e.g. `foz`) |
| `displayName` | `text` | Not Null | Preserved casing from first usage (e.g. `FOZ`) |
| `createdAt` | `timestamp` | Default `now()`, Not Null | First time hashtag was created |

### `post_hashtags` Junction Table
Links posts to associated hashtags.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `postId` | `uuid` | Foreign Key -> `posts.id` (`ON DELETE CASCADE`), Not Null | Associated post ID |
| `hashtagId` | `uuid` | Foreign Key -> `hashtags.id` (`ON DELETE CASCADE`), Not Null | Associated hashtag ID |

**Composite Primary Key**: `(postId, hashtagId)`

---

## Database Indexes

- `idx_hashtags_name`: Index on `hashtags(name)` for fast lookup during extraction and filtering.
- `idx_post_hashtags_hashtag_id`: Index on `post_hashtags(hashtag_id)` for quick join filtering.
- `idx_post_hashtags_post_id`: Index on `post_hashtags(post_id)` for post deletion cascading.

---

## Shared Schemas (`src/shared/schemas/hashtags.ts`)

```typescript
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
```
