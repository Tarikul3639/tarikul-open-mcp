# Tarikul Open MCP API

NestJS API for Google sign-in, Google Calendar authorization, MCP OAuth, and calendar tools. It uses PostgreSQL through Prisma and serves MCP over Streamable HTTP.

## OAuth consent screen

![MCP client consent page](../screenshots/oauth_consent.png)

The client name shown on the consent page comes from the MCP client's OAuth registration. Users can approve or deny access from this page.

## Requirements

- Node.js 24
- pnpm 12
- PostgreSQL
- Google OAuth client credentials

## Local setup

From this directory:

```bash
pnpm install
cp .env.example .env
```

Configure the values in `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client credentials |
| `GOOGLE_REDIRECT_URI` | Google sign-in callback; local default is `http://localhost:5000/api/auth/callback` |
| `GOOGLE_CALENDAR_REDIRECT_URI` | Calendar authorization callback; local default is `http://localhost:5000/api/auth/calendar/callback` |
| `WEB_ORIGIN` | Frontend origin used after OAuth; local default is `http://localhost:3000` |
| `MCP_ISSUER_URL` | Public base URL of this API, used in OAuth discovery and tokens |
| `MCP_RESOURCE_URL` | Public MCP endpoint URL, normally `<API origin>/mcp` |
| `MCP_AUTH_SECRET` | Secret used to sign MCP access tokens; use a random value with at least 32 characters |
| `CORS_ORIGINS` | Optional comma-separated browser origins allowed by the API |
| `PORT` | API port; defaults to `5000` |

Create the PostgreSQL database named in `DATABASE_URL`, generate the Prisma client, apply migrations, and start the API:

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

`pnpm prisma:migrate` runs `prisma migrate deploy`. Use `pnpm prisma:migrate:dev -- --name <migration-name>` when creating a schema migration during development.

In Google Cloud Console, add the exact URLs configured in `GOOGLE_REDIRECT_URI` and `GOOGLE_CALENDAR_REDIRECT_URI` as authorized redirect URIs. For local development, the example callbacks use `localhost:5000`; the web and API share the `localhost` cookie host. In production with separate web and API domains, set both callbacks to the web app's proxied `/api/...` URLs (for example `https://<web-domain>/api/auth/callback` and `https://<web-domain>/api/auth/calendar/callback`) so browser sessions remain on the web origin. The web app proxies `/api/*` and `/.well-known/*` to the API.

## MCP tools

Calendar tools use the connected user's **primary Google Calendar**. Calendar creation and modification require Google Calendar write access.

| Tool | Description |
| --- | --- |
| `calendar_list_events` | List upcoming events. Optional `maxResults` ranges from 1 to 100 and defaults to 10. |
| `calendar_find_events_by_date` | Search between `startDate` and `endDate` (ISO 8601 date-times with timezone); returns up to 100 events. |
| `calendar_find_event` | Get one event by `eventId`. |
| `calendar_create_event` | Create an event with `summary`, `start`, and `end`; `description` and Google Calendar `colorId` are optional. |
| `calendar_update_event` | Update an event by `eventId`; optional fields are `summary`, `description`, `start`, `end`, and `colorId`. Omitted fields remain unchanged. |
| `calendar_delete_event` | Permanently delete an event by `eventId`. |
| `health_check` | Check whether the MCP server is running. |
| `example_tool` | Echo a supplied `message`; useful for basic client checks. |

The date-time fields use ISO 8601 with a timezone offset, for example `2026-10-22T14:00:00+06:00`. The returned event data includes its ID, summary, description, start/end, status, Google Calendar link, and color ID when present.

## HTTP endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /mcp` | Streamable HTTP MCP transport; requires a valid Bearer access token for protected tools. |
| `GET /.well-known/oauth-protected-resource/mcp` | Protected resource metadata used by MCP clients to discover authorization. |
| `GET /.well-known/oauth-authorization-server` | OAuth authorization server metadata. |
| `POST /api/auth/register` | OAuth Dynamic Client Registration (RFC 7591). |
| `GET /api/auth/authorize` | Authorization endpoint; validates the registered redirect URI and starts consent. |
| `POST /api/auth/token` | Exchange authorization codes or refresh tokens. |
| `GET /api/auth/google`, `GET /api/auth/callback` | Google identity sign-in and callback. |
| `GET /api/auth/calendar/status`, `POST /api/auth/calendar/connect`, `DELETE /api/auth/calendar/disconnect` | Manage the user's Google Calendar connection. |
| `GET /api/auth/me`, `POST /api/auth/logout`, `DELETE /api/auth/me` | Read profile, log out, or delete the signed-in account. |
| `/api/auth/clients` | List, revoke, or restore MCP client grants for the signed-in account. |
| `GET /api/health` | API and database health. |
| `GET /api/docs` | Swagger UI. |

The web app uses `/api/auth/authorize/client` and `/api/auth/authorize/consent` to load and submit the consent page.

## MCP OAuth flow

1. A client sends an unauthenticated request to `/mcp` and receives `401` with a `WWW-Authenticate` resource metadata URL.
2. The client reads the protected resource and authorization server metadata.
3. It registers its name and callback URI at `/api/auth/register` and receives a `client_id`.
4. It opens `/api/auth/authorize` in a browser using authorization code + PKCE (`S256`). The user signs in if needed and approves the client on the web consent page.
5. The API redirects to the exact registered callback URI with a short-lived authorization code. The client exchanges the code at `/api/auth/token` using its PKCE verifier.
6. The client sends `Authorization: Bearer <access_token>` to `/mcp`. Access tokens last 15 minutes; refresh tokens rotate and expire 30 days after issue.

Each grant is specific to a user and OAuth client. Removing a client from that user's dashboard blocks its current access token and refresh attempts immediately. Connecting Google Calendar is a separate step from MCP client approval; calendar tools need a Calendar connection.

## Deployment notes

Deploy the API separately from `web/`. Configure production values for `DATABASE_URL`, Google OAuth credentials and frontend-proxied callback URLs, `WEB_ORIGIN`, `MCP_ISSUER_URL`, `MCP_RESOURCE_URL`, and `MCP_AUTH_SECRET`. Set `CORS_ORIGINS` for any browser origins that call the API directly. Run `pnpm prisma:generate` and `pnpm prisma:migrate` during deployment.

## Author

**Tarikul Islam** — [tarikul-islam.me](https://tarikul-islam.me/)
