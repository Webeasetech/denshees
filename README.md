# Denshees

Open-source cold email outreach platform with automated campaigns, CRM pipeline, lead management, and AI-powered features.

![Denshees](intro.png)

## Tech Stack

| Layer    | Tech                                                                       |
| -------- | -------------------------------------------------------------------------- |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Framer Motion, SWR, Zustand |
| Backend  | Hono, BullMQ, ioredis, ImapFlow                                            |
| Database | PostgreSQL (Prisma ORM)                                                    |
| Monorepo | pnpm workspaces + Turborepo                                                |
| Infra    | Docker Compose, Redis                                                      |

## Project Structure

```
apps/
  denshees-frontend/   → Next.js web app (port 3000)
  denshees-backend/    → Hono API server (port 8100)
packages/
  database/            → Prisma schema & generated client (@denshees/database)
  eslint-config/       → Shared ESLint configs
  typescript-config/   → Shared tsconfig
  ui/                  → Shared UI components
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9
- **PostgreSQL** database (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or local)
- **Redis** (local install or via Docker)

## Quick Setup

### 1. Clone & install

```sh
git clone https://github.com/your-username/denshees.git
cd denshees
pnpm install
```

### 2. Configure environment variables

Run the setup script to copy `.env.example` files:

```sh
bash scripts/setup.sh
```

Then fill in the values:

**`apps/denshees-backend/.env`**
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `8100`) |
| `REDIS_HOST` | Redis host (`localhost` for local, `redis` for Docker) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `DATABASE_URL` | PostgreSQL connection string |

**`apps/denshees-frontend/.env`**
| Variable | Description |
|----------|-------------|
| `API_KEY` | Internal API key for backend auth |
| `OPENAI_API_KEY` | OpenAI key for AI features |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments key |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (browser) — see [Google Sign-In setup](#google-sign-in-setup) |
| `GOOGLE_CLIENT_ID` | Same Google OAuth client ID (server-side token verification) |
| `SMTP_USER` | SMTP email for sending mail |
| `SMTP_PASS` | SMTP password / app password |
| `SUPPORT_NOTIFY_EMAILS` | Comma-separated notification recipients |

### Google Sign-In setup

Denshees supports Google Sign-In on the login and signup pages. To enable it for
your own deployment:

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an **OAuth 2.0 Client ID** of type **Web application**.
2. Under **Authorized JavaScript origins**, add every origin you serve the app from:
   - `http://localhost:3000` (local development)
   - `https://your-domain.com` (production)
3. Copy the generated **Client ID** and set it as **both** of these in
   `apps/denshees-frontend/.env`:
   ```sh
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is read by the browser button and is baked into
   the build, so it must be present **before `pnpm build`** (in production it's
   written to `apps/denshees-frontend/.env.production`). `GOOGLE_CLIENT_ID` is read
   server-side to verify Google ID tokens. The same value is safe in both — an
   OAuth *client ID* is public; no client secret is required for this flow.
4. On the **OAuth consent screen**, add test users while in "Testing", or publish
   the app to allow any Google account.

> Accounts created via Google have **no password**. To also use email/password
> login, a user sets a password from **Settings → Account** after signing in.

### 3. Set up the database

```sh
pnpm --filter @denshees/database exec prisma generate
pnpm --filter @denshees/database exec prisma migrate dev
```

### 4. Start development

```sh
# Start Redis (if not running)
redis-server

# Start all apps
pnpm dev
```

Or start individually:

```sh
pnpm --filter denshees-frontend dev   # → http://localhost:3000
pnpm --filter denshees-backend dev    # → http://localhost:8100
```

## Docker

Run everything with Docker Compose:

```sh
# Make sure .env files exist in both apps
docker compose up --build
```

This starts:

- **Frontend** on port `3000`
- **Backend** on port `8100`
- **Redis** on port `6379`

## Scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `pnpm dev`              | Start all apps in dev mode                   |
| `pnpm build`            | Build all apps and packages                  |
| `pnpm lint`             | Lint all packages                            |
| `pnpm format`           | Format code with Prettier                    |
| `bash scripts/setup.sh` | Copy env files, install deps, run migrations |

## License

MIT
