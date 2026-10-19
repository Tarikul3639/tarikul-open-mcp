# Personal MCP Web

Independent Next.js frontend for the personal Google Calendar MCP dashboard. Existing pages, component layout, visual design, colors, spacing, motion, and assets are carried over from the original app. Tailwind CSS v4 and shadcn/ui are configured for UI work.

## Local setup

Copy `.env.example` to `.env.local` and set `BACKEND_URL=http://localhost:3000`, then run `pnpm install` and `pnpm dev -- --port 3001`. The frontend uses relative `/api/...` requests; `next.config.ts` rewrites them to `BACKEND_URL`, preserving same-origin dashboard cookies.

Configure the backend's `GOOGLE_REDIRECT_URIS` and Google Cloud Console with the public web callback URL, for example `https://your-domain.example/api/auth/callback`. Set `BACKEND_URL` in the frontend deployment environment.
