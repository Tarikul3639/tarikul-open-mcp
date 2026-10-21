# Tarikul Open MCP Web

Next.js frontend for the Tarikul Open MCP project. It contains the public home page, Google account dashboard, MCP OAuth consent page, and user documentation. The backend API is a separate app in [`../server/`](../server/README.md).

## Screenshots

### Home page

![Home page with the remote MCP endpoint](../screenshots/home.png)

### Account dashboard

![Dashboard with Google Calendar and MCP client access](../screenshots/dashboard.png)

### OAuth consent

![MCP client OAuth consent page](../screenshots/oauth_consent.png)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Project overview and copyable MCP endpoint. |
| `/dashboard` | Sign in with Google, connect or disconnect Calendar, manage MCP client access, and delete the account. |
| `/oauth/consent` | Review and approve or deny an MCP client's OAuth request. |
| `/docs` | Connection steps, current tool list, account security, and troubleshooting. |

## Local development

Requirements: Node.js 24, pnpm 12, and the API running locally at `http://localhost:5000`.

```bash
pnpm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_BACKEND_URL` in `.env.local` to the API's base URL. The example value is `http://localhost:5000`. Then start the frontend:

```bash
pnpm dev
```

The site runs at `http://localhost:3000` by default. Run backend setup from [`../server/README.md`](../server/README.md).

## Backend proxy

[`next.config.ts`](next.config.ts) rewrites `/api/*` and `/.well-known/*` to `NEXT_PUBLIC_BACKEND_URL`. The web app uses relative API paths, so browser requests go through the frontend origin while the Next.js server forwards them to the backend. For production deployments on separate domains, configure Google callbacks as the web app's proxied URLs (`/api/auth/callback` and `/api/auth/calendar/callback`) so the browser session cookie is set on the web origin.

For deployment, set `NEXT_PUBLIC_BACKEND_URL` to the public API origin, without a path such as `/api` or `/mcp`. Set the API's `WEB_ORIGIN` to the public frontend origin. Configure the API's `GOOGLE_REDIRECT_URI` and `GOOGLE_CALENDAR_REDIRECT_URI` as the frontend callback URLs, then add those exact URLs to the Google OAuth client's authorized redirect URIs.

## Commands

```bash
pnpm dev       # Start local development
pnpm build     # Build for deployment
pnpm start     # Serve the production build
pnpm lint      # Run ESLint
pnpm typecheck # Type-check without emitting files
```

The app uses Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui components. The frontend does not contain Google OAuth secrets; OAuth and Calendar API calls are handled by the backend.

## Author

**Tarikul Islam** — [tarikul-islam.me](https://tarikul-islam.me/)
