# CellTech Distributor — B2B Cell Phone Parts Wholesale Portal

CellTech Distributor is a production-ready **B2B e-commerce platform** for wholesale cell phone repair parts. It serves repair shops, resellers, and distributors with a full-featured product catalog, cart system, quote-request workflow, and an admin dashboard — all built on a modern Next.js stack with edge-compatible infrastructure.

---

## Features

| Area | Capability |
|------|-----------|
| **Product Catalog** | Filterable by brand, category, quality grade, and device model with full-text search |
| **Shopping Cart** | Session-based guest cart with authenticated user merge, MOQ enforcement |
| **Quote Requests** | Multi-item RFQ workflow for bulk / custom orders |
| **Order Management** | Full lifecycle tracking (Processing, Shipped, Delivered, Cancelled) |
| **Admin Dashboard** | Product CRUD, order management, quote review, and analytics |
| **Real-Time Presence** | See active users on the platform via Redis-backed sorted sets |
| **Inventory Locks** | Prevent double-purchase with distributed `SET NX EX` locks |
| **Rate Limiting** | 100 req/min per IP, 1000 req/min per authenticated user |
| **Security** | CSP, HSTS, XSS protection, input sanitization, Zod validation on every API route |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| State | Zustand (client), TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Database | Prisma ORM (SQLite dev / Neon Postgres prod) |
| Cache & Pub/Sub | Upstash Redis (REST, Edge-compatible) |
| Auth | Clerk (primary), NextAuth.js (optional fallback) |
| Payments | Stripe (optional) |
| Testing | Vitest (unit), Playwright (E2E) |
| Deployment | Vercel (Bun runtime) |

---

## Quick Start

### Prerequisites

- **Bun** >= 1.0 (or Node.js >= 18 with npm/pnpm)
- A **Neon** or local PostgreSQL database (SQLite works out of the box for development)
- An **Upstash Redis** instance (free tier is sufficient)
- **Clerk** account for authentication keys

### 1. Clone and install

```bash
git clone https://github.com/doj-scraper/iRepair.git
cd iRepair
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values. At minimum you need:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `CLERK_SECRET_KEY` | Clerk server-side key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client-side key |

### 3. Set up the database

```bash
bun run db:generate   # Generate Prisma client
bun run db:push       # Push schema to database
bun run db:seed       # (Optional) Seed sample data
```

### 4. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Run tests

```bash
bun run test          # Unit tests (Vitest)
bun run test:e2e      # E2E smoke tests (Playwright)
bun run test:all      # Both suites
```

---

## Deployment Guide

### For Non-Technical Users (Vercel One-Click)

1. Push this repository to your GitHub account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the GitHub repository.
4. Vercel will auto-detect the Next.js framework and the `vercel.json` configuration.
5. In the **Environment Variables** section, add every variable from `.env.example`.
6. Click **Deploy**. Vercel will run `bun install` and `bun run build` automatically.
7. After deployment, set up your custom domain in **Settings > Domains**.

### For Technical Users (Manual / CI)

The project ships with a `vercel.json` that configures Bun as the build runtime:

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "nextjs"
}
```

The build produces a **standalone** output (`next.config.ts` → `output: "standalone"`), which means the production artifact is a self-contained Node.js server. You can also deploy to any platform that supports Node.js:

```bash
bun run build
NODE_ENV=production node .next/standalone/server.js
```

#### Database Migrations

For production databases (Neon Postgres), run migrations before deploying:

```bash
bun run db:migrate
```

#### Redis Setup

Create a free Upstash Redis database at [console.upstash.com](https://console.upstash.com). Copy the REST URL and token into your environment variables. The application gracefully degrades if Redis is unavailable — rate limiting and caching simply become no-ops.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Production build with standalone output |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest unit tests |
| `bun run test:watch` | Run Vitest in watch mode |
| `bun run test:coverage` | Run tests with V8 coverage report |
| `bun run test:e2e` | Run Playwright E2E tests |
| `bun run test:all` | Run unit + E2E tests sequentially |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:seed` | Seed the database with sample data |
| `bun run db:studio` | Open Prisma Studio GUI |

---

## Security

The application implements multiple layers of security:

**Transport & Headers** — Strict-Transport-Security (HSTS), Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy are set via `next.config.ts` and reinforced by `vercel.json`.

**Input Validation** — Every API route validates incoming data with Zod schemas. The `withValidation` middleware (`src/lib/api-validation.ts`) provides a reusable wrapper that returns standardised 400 responses on validation failure.

**Content Sanitization** — User-generated rich text (MDX editor content) is sanitized with DOMPurify via `src/lib/sanitize.ts`. Plain-text inputs, search queries, and URLs each have dedicated sanitization functions.

**Rate Limiting** — The Edge middleware (`src/middleware.ts`) enforces sliding-window rate limits using Upstash Redis: 100 requests per minute per IP and 1000 per minute per authenticated user. Sensitive endpoints (login, register) have a stricter 10 req/min limit.

**Inventory Locks** — Distributed locks using the `SET key value NX EX 30` pattern prevent race conditions during checkout.

---

## License

This project is proprietary. All rights reserved.
