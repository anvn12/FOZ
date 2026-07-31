-- Migration to align posts, comments, reactions, and post_attachments tables with Drizzle schema

ALTER TABLE posts ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_of_id uuid REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ALTER COLUMN body DROP NOT NULL;

CREATE TABLE IF NOT EXISTS post_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_post_attachments_post_id ON post_attachments(post_id);

ALTER TABLE comments ADD COLUMN IF NOT EXISTS visibility_state text NOT NULL DEFAULT 'public';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS lifecycle_state text NOT NULL DEFAULT 'active';

ALTER TABLE reactions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
