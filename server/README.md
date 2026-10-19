# Personal MCP Server API

NestJS backend for Google OAuth, personal Calendar MCP, client grants, and dashboard APIs. PostgreSQL access and migrations use Prisma. Swagger UI is served at `/api/docs`.

## Local setup

1. Copy `.env.example` to `.env` and set the Google OAuth client, PostgreSQL URL, and a random `MCP_AUTH_SECRET` of at least 32 characters.
2. Create the PostgreSQL database, then run `pnpm install --no-frozen-lockfile`, `pnpm prisma:generate`, and `pnpm prisma:migrate`.
3. Set Google OAuth's authorized redirect URI to the `GOOGLE_REDIRECT_URIS` value. For local split development the web proxy callback is `http://localhost:3001/api/auth/callback`.
4. Run `pnpm start:dev`.

Use `pnpm run prisma:migrate:dev --` when authoring a schema change. The checked-in migration supports fresh installs and imports existing credentials from the legacy `google_calendar_credentials` table. Back up production data before applying it.

## API

- `/api/auth/*`: Google login, profile/session, disconnect, and personal AI-client grants.
- `/api/oauth/*`: authorization, DCR registration, PKCE code and refresh-token exchange.
- `/.well-known/oauth-*`: authorization-server and protected-resource metadata.
- `/api/mcp`: authenticated Streamable HTTP MCP endpoint with calendar tools.
- `/api/health`: backend and database health.
- `/api/docs`: Swagger UI.

The Next.js web project proxies `/api/*` and `/.well-known/*` to this service. Set `WEB_ORIGIN` and optional comma-separated `CORS_ORIGINS` to deployed web origins. OAuth registration/token endpoints also expose public OAuth CORS headers for remote MCP clients.
