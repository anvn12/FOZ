# Data Model Specification: Post Summarize (TL;DR)

## Database Schema (Drizzle ORM)

### Table: `post_summaries`
Located in `src/backend/db/schema/interactions.ts` (or `src/backend/db/schema/post-summaries.ts`).

```typescript
export const postSummaries = pgTable(
  "post_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    postSnapshot: text("post_snapshot").notNull(),
    keyHighlights: text("key_highlights").array().notNull(),
    sentiment: text("sentiment").notNull(),
    commentCount: integer("comment_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_post_summaries_post_id").on(t.postId),
  ]
);

export type PostSummary = typeof postSummaries.$inferSelect;
export type NewPostSummary = typeof postSummaries.$inferInsert;
```

---

## Shared Zod Schemas (`src/shared/schemas/post-summary.ts`)

```typescript
import { z } from "zod";

export const postSummarySchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  postSnapshot: z.string(),
  keyHighlights: z.array(z.string()),
  sentiment: z.string(),
  commentCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PostSummaryDTO = z.infer<typeof postSummarySchema>;

export const generateSummaryResponseSchema = z.object({
  success: z.boolean(),
  summary: postSummarySchema,
  cached: z.boolean(),
});
```

---

## Relationships & Constraints

- **Post 1 : 1 PostSummary**: Each post has at most one active summary record.
- **Cascade Delete**: When a post is deleted, its `post_summaries` record is deleted automatically (`onDelete: 'cascade'`).
- **Authorization & Access**: Reading/generating summaries is accessible to authenticated users (and read-only guests if post is public).
