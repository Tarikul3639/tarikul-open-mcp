CREATE TABLE IF NOT EXISTS "mcp_oauth_clients" (
  "client_id" TEXT PRIMARY KEY, "client_secret" TEXT,
  "redirect_uris" JSONB NOT NULL DEFAULT '[]', "client_name" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "mcp_oauth_grants" (
  "user_id" TEXT NOT NULL, "client_id" TEXT NOT NULL REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "revoked_at" TIMESTAMPTZ,
  PRIMARY KEY ("user_id", "client_id")
);
CREATE INDEX IF NOT EXISTS "mcp_oauth_grants_user_created_idx" ON "mcp_oauth_grants"("user_id", "created_at" DESC);
CREATE TABLE IF NOT EXISTS "mcp_authorization_codes" (
  "code" TEXT PRIMARY KEY, "client_id" TEXT NOT NULL REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE,
  "redirect_uri" TEXT NOT NULL, "code_challenge" TEXT NOT NULL, "code_challenge_method" TEXT NOT NULL DEFAULT 'S256',
  "user_id" TEXT NOT NULL, "expires_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "mcp_refresh_tokens" (
  "token_hash" TEXT PRIMARY KEY, "client_id" TEXT NOT NULL REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL, "family_id" TEXT NOT NULL, "expires_at" TIMESTAMPTZ,
  "used_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "mcp_refresh_tokens_user_id_idx" ON "mcp_refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "mcp_refresh_tokens_family_id_idx" ON "mcp_refresh_tokens"("family_id");
CREATE INDEX IF NOT EXISTS "mcp_refresh_tokens_expires_at_idx" ON "mcp_refresh_tokens"("expires_at");
CREATE TABLE IF NOT EXISTS "mcp_access_tokens" (
  "token_id" TEXT PRIMARY KEY, "client_id" TEXT NOT NULL REFERENCES "mcp_oauth_clients"("client_id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL, "expires_at" TIMESTAMPTZ NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "google_calendar_accounts" (
  "user_id" TEXT PRIMARY KEY, "tokens" JSONB NOT NULL, "email" TEXT NOT NULL,
  "name" TEXT, "picture" TEXT, "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DO $$ BEGIN
  IF to_regclass('public.google_calendar_credentials') IS NOT NULL THEN
    INSERT INTO "google_calendar_accounts" ("user_id", "tokens", "email", "name", "picture", "updated_at")
      SELECT lower("email"), "tokens", "email", "name", "picture", "updated_at"
      FROM "google_calendar_credentials" WHERE "email" IS NOT NULL AND "email" <> ''
      ON CONFLICT ("user_id") DO NOTHING;
  END IF;
END $$;
