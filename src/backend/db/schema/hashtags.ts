import { pgTable, uuid, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { posts } from "./interactions.js";

export const hashtags = pgTable(
  "hashtags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_hashtags_name").on(table.name),
  ]
);

export const postHashtags = pgTable(
  "post_hashtags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    hashtagId: uuid("hashtag_id")
      .notNull()
      .references(() => hashtags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.hashtagId] }),
    index("idx_post_hashtags_hashtag_id").on(table.hashtagId),
    index("idx_post_hashtags_post_id").on(table.postId),
  ]
);
