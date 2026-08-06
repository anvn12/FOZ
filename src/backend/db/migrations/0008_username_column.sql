ALTER TABLE "user_accounts" ADD COLUMN IF NOT EXISTS "username" text;

DO $$
DECLARE
    r RECORD;
    base_name text;
    final_name text;
    counter integer;
BEGIN
    FOR r IN SELECT id, email FROM user_accounts WHERE username IS NULL LOOP
        base_name := LOWER(SPLIT_PART(r.email, '@', 1));
        base_name := REGEXP_REPLACE(base_name, '[^a-z0-9._]', '_', 'g');
        IF LENGTH(base_name) < 3 THEN
            base_name := RPAD(base_name, 3, '_');
        END IF;
        IF LENGTH(base_name) > 25 THEN
            base_name := SUBSTRING(base_name FROM 1 FOR 25);
        END IF;

        final_name := base_name;
        counter := 1;
        WHILE EXISTS (SELECT 1 FROM user_accounts WHERE LOWER(username) = LOWER(final_name) AND id <> r.id) LOOP
            final_name := base_name || counter;
            counter := counter + 1;
        END LOOP;

        UPDATE user_accounts SET username = final_name WHERE id = r.id;
    END LOOP;
END $$;

ALTER TABLE "user_accounts" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "user_accounts_username_lower_idx" ON "user_accounts" USING btree ("username");
