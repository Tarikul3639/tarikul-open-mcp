# Personal MCP Server API

NestJS backend for Google OAuth, personal Calendar MCP, client grants, and dashboard APIs. PostgreSQL access and migrations use Prisma. Swagger UI is served at `/api/docs`.

## Local setup

1. Copy `.env.example` to `.env` and set the Google OAuth client, PostgreSQL URL, and a random `MCP_AUTH_SECRET` of at least 32 characters.
2. Create the PostgreSQL database, then run `pnpm install --no-frozen-lockfile`, `pnpm prisma:generate`, and `pnpm prisma:migrate`.
3. Set Google OAuth's authorized redirect URI to the `GOOGLE_REDIRECT_URIS` value. For local split development the web proxy callback is `http://localhost:3001/api/auth/callback`.
4. Run `pnpm start:dev`.

Use `pnpm run prisma:migrate:dev --` when authoring a schema change. The checked-in migration supports fresh installs and imports existing credentials from the legacy `google_calendar_credentials` table. Back up production data before applying it.

## API

- `/api/auth/google`, `/api/auth/callback`: Google login. `/api/auth/google?next=/some/path` returns the user to that web path after login.
- `/api/auth/me`, `/api/auth/logout`, `/api/auth/clients`: profile/session and personal MCP-client grants (list, revoke, restore).
- `/api/auth/register`: OAuth Dynamic Client Registration (RFC 7591) for MCP clients.
- `/api/auth/authorize`: authorization endpoint (PKCE S256). Sends the browser to the web consent page `/oauth/consent`.
- `/api/auth/authorize/client`, `/api/auth/authorize/consent`: used by the consent page to show the client and record Allow / Deny.
- `/api/auth/token`: authorization-code and refresh-token exchange (form or JSON, `client_secret_post` / `client_secret_basic` for confidential clients).
- `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource[/mcp]`: discovery metadata.
- `/mcp`: Streamable HTTP MCP endpoint. Requests without a valid Bearer token get `401` with `WWW-Authenticate: Bearer resource_metadata="..."`.
- `/api/health`: backend and database health.
- `/api/docs`: Swagger UI.

The Next.js web project proxies `/api/*` and `/.well-known/*` to this service. Set `WEB_ORIGIN` and optional comma-separated `CORS_ORIGINS` to deployed web origins.

## How an MCP client gets a token

1. The client calls `/mcp` without a token and receives `401` + `WWW-Authenticate`.
2. It reads `/.well-known/oauth-protected-resource/mcp`, then `/.well-known/oauth-authorization-server`.
3. It registers itself at `/api/auth/register` and receives a `client_id`.
4. It opens `/api/auth/authorize?...` in the browser. The user lands on `/oauth/consent`; if not signed in, "Continue with Google" signs them in and returns to the same consent page.
5. The user clicks Allow. The grant is saved and the browser is redirected to the client's `redirect_uri` with `code` and `state`.
6. The client exchanges the code at `/api/auth/token` (with the PKCE `code_verifier`) and calls `/mcp` with `Authorization: Bearer <access_token>`.

If the user already approved the client, step 4 redirects straight back with a code. Revoking a client in the dashboard blocks its access and refresh tokens immediately; the consent page is shown again on the next login.
