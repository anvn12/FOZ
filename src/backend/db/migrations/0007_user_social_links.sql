CREATE TABLE IF NOT EXISTS "user_social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL REFERENCES "user_accounts"("id") ON DELETE cascade,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"provider_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_social_links_user_account_id_idx" ON "user_social_links" ("user_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_social_links_provider_user_idx" ON "user_social_links" ("provider", "provider_user_id");
