import {
  pgTable,
  type AnyPgColumn,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { contentLifecycleStates, contentVisibilityStates, reactionKinds, reportStatuses, reportSubjectTypes, reportReasonTypes } from "#shared/schema-enums.js";
import { userAccounts } from "./users.js";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "restrict" }),
    content: text("content"),
    parentId: uuid("parent_id").references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    repostOfId: uuid("repost_of_id").references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    visibilityState: text("visibility_state", { enum: contentVisibilityStates }).notNull(),
    lifecycleState: text("lifecycle_state", { enum: contentLifecycleStates }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_posts_author_id").on(t.authorId),
    index("idx_posts_parent_id").on(t.parentId),
    index("idx_posts_repost_of_id").on(t.repostOfId),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "restrict" }),
    parentCommentId: uuid("parent_comment_id").references((): AnyPgColumn => comments.id, {
      onDelete: "cascade",
    }),
    body: text("body").notNull(),
    visibilityState: text("visibility_state", { enum: contentVisibilityStates }).notNull(),
    lifecycleState: text("lifecycle_state", { enum: contentLifecycleStates }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_comments_post_id").on(t.postId), index("idx_comments_parent_comment_id").on(t.parentCommentId)],
);

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["post", "comment"] }).notNull(),
    targetId: uuid("target_id").notNull(),
    reactionKind: text("reaction_kind", { enum: reactionKinds }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_reactions_target").on(t.targetType, t.targetId),
    uniqueIndex("reactions_user_target_kind_idx").on(t.userAccountId, t.targetType, t.targetId, t.reactionKind),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "restrict" }),
    targetType: text("target_type", { enum: reportSubjectTypes }).notNull(),
    targetId: uuid("target_id").notNull(),
    reasonType: text("reason_type", { enum: reportReasonTypes }).notNull(),
    details: text("details"),
    status: text("status", { enum: reportStatuses }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reports_target_idx").on(t.targetType, t.targetId),
    index("reports_status_idx").on(t.status),
  ]
);

export const postAttachments = pgTable(
  "post_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_post_attachments_post_id").on(t.postId)],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostAttachment = typeof postAttachments.$inferSelect;
export type NewPostAttachment = typeof postAttachments.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;

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
  ],
);

export type PostSummary = typeof postSummaries.$inferSelect;
export type NewPostSummary = typeof postSummaries.$inferInsert;