# Personal MCP Server

The project is split into two independent applications:

- [`server/`](server/README.md): NestJS backend, PostgreSQL + Prisma, Google OAuth, MCP Streamable HTTP API, and Swagger.
- [`web/`](web/README.md): Next.js frontend with the existing dashboard design, Tailwind CSS, shadcn/ui, and same-origin API proxy.

Keep `server` and `web` as separate deployable projects. Configure the web deployment's `BACKEND_URL` to the backend URL. Configure backend `.env` with PostgreSQL, Google OAuth credentials, the public issuer URL, and web origin. Run Prisma migrations from `server` before starting the API.

The original full-stack implementation remains in the root working tree until both applications have been verified. The `pre-nestjs-migration` tag records the pre-migration source snapshot.
