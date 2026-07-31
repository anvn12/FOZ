CREATE TABLE IF NOT EXISTS post_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  post_snapshot text NOT NULL DEFAULT '',
  key_highlights text[] NOT NULL DEFAULT '{}',
  sentiment text NOT NULL DEFAULT 'Neutral',
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE post_summaries ALTER COLUMN summary_text DROP NOT NULL;
ALTER TABLE post_summaries ALTER COLUMN provider_name DROP NOT NULL;
ALTER TABLE post_summaries ALTER COLUMN summary_state DROP NOT NULL;

ALTER TABLE post_summaries ADD COLUMN IF NOT EXISTS post_snapshot text NOT NULL DEFAULT '';
ALTER TABLE post_summaries ADD COLUMN IF NOT EXISTS key_highlights text[] NOT NULL DEFAULT '{}';
ALTER TABLE post_summaries ADD COLUMN IF NOT EXISTS sentiment text NOT NULL DEFAULT 'Neutral';
ALTER TABLE post_summaries ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS idx_post_summaries_post_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_summaries_post_id ON post_summaries(post_id);
