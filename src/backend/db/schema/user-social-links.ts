import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { userAccounts } from "./users.js";

export const userSocialLinks = pgTable(
  "user_social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'google' | 'facebook'
    providerUserId: text("provider_user_id").notNull(),
    providerEmail: text("provider_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("user_social_links_user_account_id_idx").on(t.userAccountId),
    uniqueIndex("user_social_links_provider_user_idx").on(
      t.provider,
      t.providerUserId,
    ),
  ],
);

export type UserSocialLink = typeof userSocialLinks.$inferSelect;
export type NewUserSocialLink = typeof userSocialLinks.$inferInsert;
