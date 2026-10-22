# Lomzi

> Everyday finds, made simple.

Lomzi is a full-stack grocery commerce application with a responsive customer storefront and a
role-protected administration portal. It is an npm-workspace portfolio project built around a
React single-page application, an Express API, and PostgreSQL. Checkout currently supports Cash on
Delivery; no external payment gateway is integrated.

## Live Demo

- [Source repository](https://github.com/developerkrish121/Lomzi)
- [Frontend](https://lomzi.vercel.app)
- [Backend API](https://lomzi.onrender.com)

The API exposes `GET /api/v1/health` for liveness and `GET /api/v1/readiness` for database-backed
readiness.

## Features

### Customer experience

- Registration, login, logout, remember-me sessions, and session restoration through `HttpOnly`
  cookies
- Product search, categories, price filters, sorting, pagination, and product details
- Persistent, authenticated cart with stock and quantity validation
- Address creation, editing, deletion, and default-address management
- Transactional Cash on Delivery checkout with stock reservation and client-generated idempotency
  keys
- Order history, order details, success confirmation, and status timeline
- Responsive layouts, loading and empty states, offline feedback, and accessible form validation

### Administration

- Separate, rate-limited administrator login and role-protected routes
- Dashboard metrics
- Category and product creation, editing, soft deletion, availability, and inventory controls
- Paginated order management with validated status transitions

### Reliability and security

- Zod request/environment validation and centralized JSON error handling
- Helmet, credentialed CORS, trusted-origin checks, secure production cookies, and configurable
  reverse-proxy trust
- Independent in-memory IP rate limits for registration, customer login, and administrator login
- Serializable checkout, cart/address concurrency handling, bounded retries for recognized Prisma
  transaction conflicts, and per-customer checkout idempotency
- Lightweight liveness and database-backed readiness endpoints

## Tech stack

| Area       | Technology                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Frontend   | React 19, Vite 7, React Router, TanStack Query, Axios, Tailwind CSS, React Hook Form, Zod, Framer Motion, Recharts |
| Backend    | Node.js 22, Express 5, Prisma 6, PostgreSQL, JSON Web Tokens, bcrypt                                               |
| Testing    | Node test runner, Supertest, Vitest, Testing Library                                                               |
| Deployment | Vercel (frontend), Render (API), Neon (PostgreSQL), GitHub                                                         |

## Architecture

```text
frontend/               React/Vite SPA
  src/features/         Feature APIs, hooks, and schemas
  src/pages/            Customer and administrator pages
  src/components/       Shared UI and domain components
backend/                Express API
  src/routes/           HTTP route definitions
  src/controllers/      Request/response handling
  src/services/         Business rules and transaction orchestration
  src/repositories/     Prisma data access
  src/validators/       Zod request schemas
  prisma/               PostgreSQL schema, migrations, and seed
```

The browser sends credentialed requests to `/api/v1`. The API uses a signed JWT in an `HttpOnly`
cookie and persists users, products, carts, addresses, orders, and inventory in PostgreSQL.
Internal package names retain the original `@quickbasket/*` scope to avoid unnecessary
infrastructure changes.

## Local development

### Prerequisites

- Node.js 22
- npm 10 or newer
- PostgreSQL database

### Installation

```bash
git clone https://github.com/developerkrish121/Lomzi.git
cd Lomzi
npm install
```

1. Copy `backend/.env.example` to `backend/.env` and configure a local PostgreSQL connection and
   authentication settings.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not available at the documented
   local default.
3. Generate Prisma Client and apply the committed migrations:

```bash
npm run prisma:generate
npm run prisma:migrate --workspace backend
```

4. Start both workspaces:

```bash
npm run dev
```

The development defaults are `http://localhost:5173` for the frontend and
`http://localhost:5000/api/v1` for the API.

## Environment configuration

Never commit real credentials. Local `.env` files are ignored; only the example files belong in
source control.

### Backend (`backend/.env`)

| Variable                     | Guidance                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`               | PostgreSQL URL used by Prisma and the running API. Use Neon's pooled URL in production.         |
| `DIRECT_URL`                 | Direct/unpooled Neon URL used only for the documented production migration command.             |
| `JWT_SECRET`                 | JWT signing secret; validation requires at least 32 characters.                                 |
| `PORT`                       | API port. Defaults to `5000`; Render supplies it in production.                                 |
| `NODE_ENV`                   | `development`, `test`, or `production`.                                                         |
| `CORS_ORIGIN`                | One exact allowed frontend origin, without a trailing slash.                                    |
| `JWT_EXPIRES_IN`             | Normal token lifetime as a `jsonwebtoken` duration string, such as `1d`.                        |
| `JWT_REMEMBER_EXPIRES_IN`    | Remember-me token lifetime as a duration string, such as `30d`.                                 |
| `AUTH_COOKIE_NAME`           | Stable name for the authentication cookie.                                                      |
| `TRUST_PROXY_HOPS`           | Trusted reverse-proxy hop count; use `0` locally and the verified provider count in production. |
| `AUTH_RATE_LIMIT_WINDOW_MS`  | Authentication rate-limit window in milliseconds.                                               |
| `AUTH_RATE_LIMIT_MAX`        | Per-IP registration/customer-login attempts per window.                                         |
| `ADMIN_LOGIN_RATE_LIMIT_MAX` | Stricter per-IP administrator-login attempts per window.                                        |
| `SEED_ADMIN_EMAIL`           | Seed-only administrator email; not required by the running API.                                 |
| `SEED_ADMIN_PASSWORD`        | Seed-only administrator password; not required by the running API.                              |
| `TEST_DATABASE_URL`          | Explicit, isolated PostgreSQL integration-test database URL.                                    |

### Frontend (`frontend/.env`)

| Variable       | Guidance                                                               |
| -------------- | ---------------------------------------------------------------------- |
| `VITE_API_URL` | Public API base URL including `/api/v1`; Vite embeds it at build time. |

Production cookies use `HttpOnly`, `Secure`, and `SameSite=None`. The browser origin must exactly
match `CORS_ORIGIN`, and frontend requests must send credentials. The API currently accepts one
configured origin, so arbitrary Vercel preview origins are not supported. Related frontend and API
custom domains are recommended because some browsers block third-party cookies across the default
provider domains.

## Database and seed

Validate the schema and generate Prisma Client without changing a database:

```bash
npm run prisma:validate
npm run prisma:generate
```

Apply pending committed migrations to the database identified by `DATABASE_URL`:

```bash
npm run prisma:migrate --workspace backend
```

For Neon production migrations, positively verify the direct URL targets the intended production
database, then map it explicitly for Prisma:

```bash
DATABASE_URL="$DIRECT_URL" npm run prisma:migrate --workspace backend
```

Do not use `prisma migrate dev`, reset commands, development databases, or test databases in
production. The repository contains ordered migrations, including checkout idempotency and the
single-default-address constraint.

To load catalogue data and create an initial administrator, configure the two seed-only variables
and run:

```bash
npm run prisma:seed --workspace backend
```

Production seeding refuses missing or weak administrator credentials. Repeated runs do not reset an
existing administrator password or reactivate a disabled account.

## Testing and quality

These commands are defined by the repository:

```bash
npm test                  # backend unit/API tests, then frontend tests
npm run lint              # ESLint across both workspaces
npm run format:check      # Prettier verification
npm run build             # Vite build and Prisma Client generation
npm run prisma:validate   # Prisma schema validation
```

The normal test suite does not require PostgreSQL. Critical concurrency and transaction behavior
has a separate guarded integration suite:

```bash
npm run test:postgres --workspace backend
```

It runs only with an explicit `TEST_DATABASE_URL`, requires a test-only database name, rejects
targets matching configured application database URLs, applies pending committed migrations, and
deletes only records created by that test run.

## Deployment

### Vercel frontend

- Root directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `VITE_API_URL`

[`frontend/vercel.json`](frontend/vercel.json) rewrites SPA deep links to `index.html`.

### Render backend

The repository-root [`render.yaml`](render.yaml) defines the web service:

- Root directory: repository root
- Build command: `npm ci && npm run build --workspace backend`
- Start command: `npm start --workspace backend`
- Health check: `/api/v1/readiness`
- Runtime secrets/configuration: set the backend variables listed above in Render, not Vercel

The free-plan-compatible Blueprint intentionally has no pre-deploy command. Run verified production
migrations separately before deploying code that depends on them.

### Neon PostgreSQL

- Keep production, development, and integration-test databases separate.
- Use a pooled Neon URL as Render's runtime `DATABASE_URL`.
- Keep the direct/unpooled URL as `DIRECT_URL` for migrations only.
- Preserve Neon's required TLS query parameters and never expose either URL to the frontend.

After deployment, verify `/api/v1/health`, `/api/v1/readiness`, SPA deep-link refreshes, and the
complete authentication, cart, checkout, and administrator flows in a browser.

## Known limitations

- Cash on Delivery only; no payment gateway or webhook processing
- Account details are view-only; password reset/change is not implemented
- Authentication rate limits are process-local and reset when an API instance restarts
- Customer order history is not paginated
- One production CORS origin is supported
- PostgreSQL integration tests require a separately configured isolated database
- No committed CI workflow or external observability backend
