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
| `DATABASE_URL`               | PostgreSQL connection read by Prisma and the running API.              |
| `DIRECT_URL`                 | Direct Neon URL explicitly mapped to `DATABASE_URL` for migrations.    |
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
delete only records whose generated IDs they tracked during that run. The suite has been exercised
against an isolated Neon test database, but it remains opt-in and must be rerun after relevant
database changes. The normal `npm test` command explicitly excludes the PostgreSQL suite; it can run
only through the guarded command above.

## Production deployment: Vercel, Render, and Neon

The intended topology is a Vercel frontend calling a Render web service backed by Neon PostgreSQL.
`frontend/vercel.json` sends SPA deep links to `index.html`. The root `render.yaml` describes the
backend without embedding secrets. Importing that Blueprint or creating the services in provider
dashboards remains a manual action; no deployment has been performed from this repository.

### 1. Create the Neon database

1. Create a dedicated production project/database and keep it separate from development and test
   databases.
2. Copy Neon's pooled connection string into Render as `DATABASE_URL`. Preserve the TLS parameters
   supplied by Neon and use the pooler hostname for the long-running API.
3. Copy Neon's direct/unpooled connection string into Render as `DIRECT_URL`. The current Prisma
   datasource does not declare `directUrl`; the documented migration command explicitly maps this
   value to `DATABASE_URL`. Do not expose either URL to Vercel or commit it.
4. Before the first API deployment, positively verify the Neon project and database named by
   `DIRECT_URL`: it must be the dedicated production database, must not contain a `test`, `testing`,
   or `ci` name token, and must not equal any development or test target. Then apply only the
   committed migrations as described below. Never use `prisma migrate dev` or a reset command in
   production.

### 2. Configure the Render backend

Either import the root `render.yaml` as a Render Blueprint or create a **Web Service** from the
repository with these equivalent dashboard settings:

- Runtime: Node
- Root directory: leave blank (repository root; the workspace lockfile is here)
- Build command: `npm ci && npm run build --workspace backend`
- Start command: `npm start --workspace backend`
- Health check path: `/api/v1/readiness`
- Node version: 22, enforced by the root `package.json`

Required Render runtime variables are `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and
`AUTH_COOKIE_NAME`; the first two are secrets. `DIRECT_URL` is a deployment-only secret used for
migrations and is not read by the running application. Runtime/configuration variables are `NODE_ENV`, `TRUST_PROXY_HOPS`,
`JWT_EXPIRES_IN`, `JWT_REMEMBER_EXPIRES_IN`, `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`, and
`ADMIN_LOGIN_RATE_LIMIT_MAX`. The Blueprint supplies safe non-secret defaults for the latter group
except `AUTH_COOKIE_NAME`, which must be chosen deliberately and then kept stable. Set
`NODE_ENV=production`, set `CORS_ORIGIN` to the exact HTTPS Vercel production origin without a
trailing slash, and use `TRUST_PROXY_HOPS=1` behind Render's proxy. Do not set `PORT`; Render supplies
it and the server binds it on `0.0.0.0`.

Use `/api/v1/readiness` as the Render health check so a new instance receives traffic only after it
can reach PostgreSQL. Keep `/api/v1/health` for lightweight external liveness monitoring. A readiness
failure returns a generic `503` without connection details.

The Blueprint deliberately omits `preDeployCommand` so it is compatible with Render's free plan.
Before the first deployment—and before later deployments that add migrations—verify `DIRECT_URL` as
described above, then run this from a trusted Linux/macOS shell or CI job:

```bash
DATABASE_URL="$DIRECT_URL" npm run prisma:migrate --workspace backend
```

This command does not read `TEST_DATABASE_URL`. Stop if `DIRECT_URL` is unset or its decoded database
name is not the expected production database. On a paid Render service, the same command may be
configured as a pre-deploy command only after completing those checks; Render pre-deploy commands
are a paid-service feature.

`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are not runtime variables. If initial catalogue/admin
data is required, add them temporarily and run `npm run prisma:seed --workspace backend` in an
authorized Render shell. Remove the seed variables afterward. Re-running the seed does not reset or
reactivate an administrator.

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

Vercel needs only `VITE_API_URL`. Render/Neon credentials, JWT settings, seed credentials, and
`TEST_DATABASE_URL` must never be configured in the Vercel project.

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

Dashboard-only actions still required are: authorize both providers to access the GitHub repository,
select branch `main`, enter secret values, choose service plans and regions, run verified production
migrations from a trusted environment (or optionally configure the command on a paid Render plan),
and assign custom domains/DNS. After adding domains, update both `CORS_ORIGIN` and `VITE_API_URL` and
redeploy both services.

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
- PostgreSQL concurrency tests are opt-in and require an explicitly isolated test database.
- Vercel SPA routing is configured, but Render and Neon still require the documented manual
  dashboard setup. No CI workflow, centralized rate-limit store, or observability backend is
  committed.
