# Lomzi

Lomzi is a full-stack quick-commerce grocery application with customer shopping flows and an
administrator portal. Its brand promise is “Everyday finds, made simple.” It is intended as a
portfolio project and currently supports Cash on Delivery rather than external payment processing.

## Architecture

Lomzi is an npm-workspace monorepo. Technical package scopes and other internal identifiers retain
their original names to avoid risky infrastructure and database changes:

- `frontend/` — React 19 and Vite 7 single-page application using React Router, TanStack Query,
  Axios, React Hook Form, Zod, Tailwind CSS, Framer Motion, and Recharts.
- `backend/` — Node.js 22 and Express 5 API organized into routes, controllers, services, and
  Prisma repositories.
- `backend/prisma/` — PostgreSQL schema, ordered migrations, and catalogue/admin seed data.

The database models users, categories, products, carts, addresses, orders, and their line items.
Product deletion is soft, cart ownership is user-scoped, and checkout reserves stock in a
serializable transaction. Client-generated checkout idempotency keys are unique per customer, so a
safe retry returns the original order without reserving stock again.

## Implemented features

Customer features include registration and login, cookie-based session restoration, product search,
category and price filters, sorting, pagination, product details, a persistent cart, address
management, checkout, and order history/details.

The administrator portal includes role-protected login, dashboard metrics, category and product
management, inventory controls, order listing, and validated order-status transitions.

Operational behavior includes Zod request validation, centralized JSON errors, Helmet, CORS,
graceful shutdown, IP-based authentication rate limiting, a lightweight liveness endpoint, and a
database-backed readiness endpoint.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and replace every placeholder needed locally.
2. Copy `frontend/.env.example` to `frontend/.env` if the API does not use the default URL.
3. Install dependencies with `npm install`.
4. Generate Prisma Client with `npm run prisma:generate`.
5. Apply migrations with `npm run prisma:migrate --workspace backend`.
6. Optionally seed the catalogue and initial administrator as described below.
7. Start both applications with `npm run dev`.

Development defaults are `http://localhost:5173` for the frontend and `http://localhost:5000` for
the API.

## Environment variables

Backend variables:

| Variable                     | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`               | PostgreSQL connection used by the API and Prisma migrations.           |
| `DIRECT_URL`                 | Direct Neon URL used only by the production migration command.         |
| `JWT_SECRET`                 | JWT signing secret; must contain at least 32 characters.               |
| `PORT`                       | API port; defaults to `5000`.                                          |
| `NODE_ENV`                   | `development`, `test`, or `production`.                                |
| `CORS_ORIGIN`                | Allowed browser origin. The current implementation accepts one origin. |
| `JWT_EXPIRES_IN`             | Normal session token lifetime.                                         |
| `JWT_REMEMBER_EXPIRES_IN`    | Remember-me token lifetime.                                            |
| `AUTH_COOKIE_NAME`           | Authentication cookie name.                                            |
| `TRUST_PROXY_HOPS`           | Exact trusted reverse-proxy hop count; keep `0` without a proxy.       |
| `AUTH_RATE_LIMIT_WINDOW_MS`  | Registration/login rate-limit window.                                  |
| `AUTH_RATE_LIMIT_MAX`        | Independent per-IP limit for registration and customer login.          |
| `ADMIN_LOGIN_RATE_LIMIT_MAX` | Stricter per-IP admin-login limit.                                     |
| `SEED_ADMIN_EMAIL`           | Initial administrator email, used only by the seed.                    |
| `SEED_ADMIN_PASSWORD`        | Initial administrator password, used only by the seed.                 |
| `TEST_DATABASE_URL`          | Explicit isolated database for PostgreSQL concurrency tests only.      |

Frontend variable:

| Variable       | Purpose                                   |
| -------------- | ----------------------------------------- |
| `VITE_API_URL` | Public API base URL, including `/api/v1`. |

Never commit real credentials. `.env` and `.env.*` files are ignored except for example files.

## Authentication and security

Authentication endpoints are:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/admin/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

JWTs are stored in `HttpOnly` cookies. Local cookies use `SameSite=Lax`; production cookies use
`SameSite=None` and `Secure` so credentialed requests work between the Vercel and Render sites.
Production unsafe requests with a browser `Origin` header are accepted only from `CORS_ORIGIN`.
Remember-me creates a persistent cookie; otherwise it is a browser-session cookie. Registration,
customer login, and admin login use separate in-memory IP counters; admin login has the lower limit.
Counters are process-local and reset on restart, so horizontally scaled production deployments need
a shared rate-limit store.

Set `TRUST_PROXY_HOPS` only to the known number of proxy hops. Incorrectly trusting forwarded headers
can make IP controls unreliable.

## Safe seeding

Configure `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` locally before running:

```bash
npm run prisma:seed --workspace backend
```

The password must be 12–72 characters and contain uppercase, lowercase, numeric, and special
characters. In production, missing or weak credentials stop administrator seeding. Re-running the
seed never resets an existing administrator password and never reactivates a disabled administrator.
Category and product records retain their existing idempotent upsert behavior.

## Database migrations

Validate and generate without changing a database:

```bash
npm run prisma:validate
npm run prisma:generate
```

Apply committed migrations to the configured database:

```bash
npm run prisma:migrate --workspace backend
```

Review `DATABASE_URL` before running migrations. The project does not provide an automatic database
creation, reset, or rollback command.

Checkout requests send `addressId` and a client-generated `idempotencyKey` to `POST /api/v1/orders`.
The first successful request returns `201`; an identical retry by the same customer returns the
original order with `200`. Reusing the key with another address returns `409
IDEMPOTENCY_KEY_REUSED`. Deploy the order-idempotency migration before deploying API and frontend
code that requires this contract.

## Health endpoints

- `GET /api/v1/health` — lightweight process liveness; does not require PostgreSQL.
- `GET /api/v1/readiness` — executes a minimal PostgreSQL query; returns `200` when ready or the
  standard `503 DATABASE_UNAVAILABLE` error without exposing connection details.

Use liveness for process restarts and readiness for deciding whether the instance should receive
traffic.

## Tests and quality checks

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Backend tests use Node's test runner and repository fakes. Frontend tests use Vitest and Testing
Library. The normal test suite does not require PostgreSQL.

Critical PostgreSQL concurrency tests are prepared for cart increments, stock limits, checkout stock
reservation/rollback, checkout idempotency (same-key concurrency, per-user key scope, and payload
conflicts), default-address uniqueness, and real Prisma `P2034` retry behavior:

```bash
npm run test:postgres --workspace backend
```

The guarded runner requires `TEST_DATABASE_URL`, requires a database name with a distinct `test`,
`testing`, or `ci` token, and refuses a physical database target matching `DATABASE_URL`, `DIRECT_URL`,
or another configured database URL even when credentials or connection options differ. It runs only
Prisma `migrate deploy` (all pending committed migrations; never reset) before the focused suite. Tests
delete only records whose generated IDs they tracked during that run. These PostgreSQL tests have **not yet been executed
successfully against a positively verified isolated test database in this environment**, so
database-level concurrency remains unverified here. The normal `npm test` command explicitly
excludes the PostgreSQL suite; it can run only through the guarded command above.

## Production deployment: Vercel, Render, and Neon

The intended topology is a Vercel frontend calling a Render web service backed by Neon PostgreSQL.
`frontend/vercel.json` sends SPA deep links to `index.html`; static files remain available through
Vercel's filesystem handling. No deployment has been performed from this repository.

### 1. Create the Neon database

1. Create a dedicated production project/database and keep it separate from development and test
   databases.
2. Copy Neon's pooled connection string into Render as `DATABASE_URL`. Keep TLS parameters supplied
   by Neon and use the pooler hostname for the long-running API.
3. Copy Neon's direct connection string into Render as `DIRECT_URL`. It is used only for migration
   deployment. Do not expose either URL to Vercel or commit it.
4. Before the first API deployment, review the target and run the committed migrations through the
   Render pre-deploy command below. Never use `prisma migrate dev` or a reset command in production.

### 2. Configure the Render backend

Create a **Web Service** from the repository with these dashboard settings:

- Runtime: Node
- Root directory: leave blank (repository root)
- Build command: `npm ci && npm run build --workspace backend`
- Pre-deploy command: `DATABASE_URL=$DIRECT_URL npm run prisma:migrate --workspace backend`
- Start command: `npm start --workspace backend`
- Health check path: `/api/v1/readiness`
- Node version: 22, enforced by the root `package.json`

Set these Render environment variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NODE_ENV`,
`CORS_ORIGIN`, `AUTH_COOKIE_NAME`, `TRUST_PROXY_HOPS`, `JWT_EXPIRES_IN`,
`JWT_REMEMBER_EXPIRES_IN`, `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`, and
`ADMIN_LOGIN_RATE_LIMIT_MAX`. Set `NODE_ENV=production`, set `CORS_ORIGIN` to the exact HTTPS Vercel
production origin without a trailing slash, and set `TRUST_PROXY_HOPS=1` for Render's single public
proxy hop. Do not set `PORT`; Render supplies it.

Use `/api/v1/readiness` as the Render health check so a new instance receives traffic only after it
can reach PostgreSQL. Keep `/api/v1/health` for lightweight external liveness monitoring. A readiness
failure returns a generic `503` without connection details. Render pre-deploy commands require a
paid service; on a plan without that feature, run the same migration command from a trusted local or
CI environment before deployment, with `DATABASE_URL` set temporarily to the direct Neon URL.

If initial catalogue/admin data is required, add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`
temporarily and run `npm run prisma:seed --workspace backend` in an authorized Render shell. Remove
the seed variables afterward. Re-running the seed does not reset or reactivate an administrator.

### 3. Configure the Vercel frontend

Create a Vercel project from the same repository with these dashboard settings:

- Framework preset: Vite
- Root directory: `frontend`
- Install command: use the detected npm command
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: 22

Set `VITE_API_URL` for Production (and Preview only when the preview origin is also allowed by the
backend) to the Render HTTPS API URL including `/api/v1`. Vite embeds this value at build time, so
redeploy the frontend after changing it. Do not add database or JWT secrets to Vercel.

The backend currently accepts exactly one `CORS_ORIGIN`. Production authentication therefore works
for the configured Vercel production origin; arbitrary Vercel preview origins will not authenticate
unless the origin policy is deliberately expanded in a future change. Both sites must use HTTPS.
For reliable browser-cookie behavior, configure frontend and API custom domains under the same
registrable domain (for example, `shop.example.com` and `api.example.com`). The default `vercel.app`
and `onrender.com` domains are cross-site, and browsers that block third-party cookies can prevent
session restoration even with correctly configured `SameSite=None; Secure` cookies.

### 4. GitHub and post-deployment verification

Connect the GitHub repository separately in Vercel and Render. Protect the production branch and
require the local/CI quality commands below before merging. In both dashboards, verify that secrets
are environment-scoped and are not exposed to pull-request previews.

After both services deploy, manually check:

- `GET https://<render-host>/api/v1/health`
- `GET https://<render-host>/api/v1/readiness`
- a direct refresh of `/products`, `/orders`, and `/admin/login` on Vercel
- registration, login, session restoration, logout, cart, checkout, and admin authorization in the
  browser while checking for CORS or cookie warnings

## Known limitations

- Cash on Delivery only; no payment gateway or webhook processing.
- Account details are view-only; password reset/change is not implemented.
- Authentication rate limits are in-memory and per process.
- Customer order history is not paginated.
- The readiness endpoint requires PostgreSQL, but liveness does not.
- PostgreSQL concurrency tests are prepared but remain unexecuted in this environment.
- Vercel SPA routing is configured, but Render and Neon still require the documented manual
  dashboard setup. No CI workflow, centralized rate-limit store, or observability backend is
  committed.
