ALTER TABLE "profiles" ADD COLUMN "username" text DEFAULT md5(random()::text) NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_unique" UNIQUE("username");