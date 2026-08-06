CREATE TABLE IF NOT EXISTS "hashtags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hashtags_name_unique" UNIQUE("name")
);

CREATE TABLE IF NOT EXISTS "post_hashtags" (
	"post_id" uuid NOT NULL,
	"hashtag_id" uuid NOT NULL,
	CONSTRAINT "post_hashtags_pkey" PRIMARY KEY("post_id","hashtag_id")
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'post_hashtags_post_id_posts_id_fk'
  ) THEN
    ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'post_hashtags_hashtag_id_hashtags_id_fk'
  ) THEN
    ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_hashtag_id_hashtags_id_fk" FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_hashtags_name" ON "hashtags" USING btree ("name");
CREATE INDEX IF NOT EXISTS "idx_post_hashtags_hashtag_id" ON "post_hashtags" USING btree ("hashtag_id");
CREATE INDEX IF NOT EXISTS "idx_post_hashtags_post_id" ON "post_hashtags" USING btree ("post_id");
