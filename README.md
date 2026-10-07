# vinext app

This project was created with create-vinext-app.

## Scripts

- `pnpm run dev` starts the vinext dev server.
- `pnpm run build` builds the Cloudflare Worker output.
- `pnpm run start` starts the built Worker locally with Wrangler.
- `pnpm run deploy` deploys the Cloudflare Worker.

## Authentication

Workspace pages and private API routes require a valid signed session. Set a unique `AUTH_SECRET` of at least 32 characters in the deployment environment before deploying; do not use the development fallback in production. For Cloudflare Workers, set it with `npx wrangler secret put AUTH_SECRET`.
