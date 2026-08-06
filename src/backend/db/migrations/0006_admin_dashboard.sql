CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"action_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"rationale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "forum_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"allow_new_posts" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"data_type" text DEFAULT 'string' NOT NULL,
	"description" text,
	"last_updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_logs_actor_id_user_accounts_id_fk'
    ) THEN
        ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actor_id_user_accounts_id_fk" FOREIGN KEY ("actor_id") REFERENCES "user_accounts"("id") ON DELETE set null ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'system_settings_last_updated_by_user_accounts_id_fk'
    ) THEN
        ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_last_updated_by_user_accounts_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "user_accounts"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_audit_actor_created" ON "admin_audit_logs" ("actor_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_action_created" ON "admin_audit_logs" ("action_type", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_categories_order" ON "forum_categories" ("display_order" ASC);
