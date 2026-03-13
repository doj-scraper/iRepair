# Architecture — CellTech Distributor

This document describes the project structure, data flow, and service boundaries of the CellTech Distributor B2B wholesale portal. It is intended for developers joining the project or reviewing the codebase.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Complete File Tree](#complete-file-tree)
3. [Data Flow](#data-flow)
4. [Service Boundaries](#service-boundaries)
5. [API Route Map](#api-route-map)
6. [State Management](#state-management)
7. [Security Architecture](#security-architecture)
8. [Testing Strategy](#testing-strategy)

---

## High-Level Overview

The application follows a **monolithic Next.js architecture** with clear separation between client-side rendering, server-side API routes, and external services. The App Router handles both page rendering and API endpoints within a single deployment unit.

```
Browser ──► Next.js Edge Middleware (rate limiting, security)
               │
               ├──► App Router Pages (SSR / CSR)
               │       └── React Components + TanStack Query + Zustand
               │
               └──► API Routes (/api/*)
                       ├── Zod Validation Layer
                       ├── Prisma ORM ──► PostgreSQL (Neon)
                       ├── Upstash Redis ──► Session Cache / Rate Limits / Locks
                       └── Clerk / Stripe (External APIs)
```

---

## Complete File Tree

```
iRepair/
├── .env.example                    # Template for environment variables
├── .gitignore                      # Git ignore rules
├── .dockerignore                   # Docker ignore rules
├── ARCHITECTURE.md                 # This file — project architecture docs
├── README.md                       # Project overview, quick start, deployment
├── Caddyfile                       # Caddy reverse proxy config (optional)
├── components.json                 # shadcn/ui component configuration
├── eslint.config.mjs               # ESLint flat config
├── next.config.ts                  # Next.js config: standalone output, security headers, CSP
├── package.json                    # Dependencies, scripts, metadata
├── playwright.config.ts            # Playwright E2E test configuration
├── postcss.config.mjs              # PostCSS config for Tailwind
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript compiler options
├── vercel.json                     # Vercel deployment config (Bun, headers)
├── vitest.config.ts                # Vitest unit test configuration
│
├── prisma/
│   ├── schema.prisma               # Database schema: Product, Order, Cart, Quote, Content
│   └── seed.ts                     # Database seed script with sample data
│
├── db/
│   └── custom.db                   # SQLite database file (development only)
│
├── public/
│   ├── logo.svg                    # Application logo
│   └── robots.txt                  # Search engine crawl rules
│
├── e2e/
│   └── smoke.spec.ts               # Playwright E2E smoke tests (pages, API, security)
│
├── examples/
│   └── websocket/
│       ├── frontend.tsx             # WebSocket client example
│       └── server.ts               # WebSocket server example
│
├── src/
│   ├── middleware.ts                # Edge middleware: rate limiting, security headers
│   │
│   ├── app/
│   │   ├── layout.tsx              # Root layout: QueryProvider, ThemeProvider, MainLayout
│   │   ├── page.tsx                # Homepage: hero, featured products, categories
│   │   ├── globals.css             # Global styles and Tailwind imports
│   │   ├── about/page.tsx          # About page
│   │   ├── contact/page.tsx        # Contact form page
│   │   ├── faq/page.tsx            # Frequently asked questions
│   │   ├── return-policy/page.tsx  # Return policy page
│   │   ├── terms/page.tsx          # Terms of service page
│   │   │
│   │   └── api/
│   │       ├── route.ts                        # GET / — Health ping
│   │       ├── health/route.ts                 # GET /health — Full service health check
│   │       ├── contact/route.ts                # POST /contact — Contact form submission
│   │       ├── presence/route.ts               # GET|POST|DELETE /presence — Real-time user presence
│   │       ├── inventory/lock/route.ts         # GET|POST|DELETE /inventory/lock — SKU locks
│   │       │
│   │       ├── products/
│   │       │   ├── route.ts                    # GET /products — Paginated product listing
│   │       │   ├── [id]/route.ts               # GET /products/:id — Single product
│   │       │   ├── brands/route.ts             # GET /products/brands — Brand list with counts
│   │       │   ├── categories/route.ts         # GET /products/categories — Category list
│   │       │   ├── device-models/route.ts      # GET /products/device-models — Models by brand
│   │       │   └── featured/route.ts           # GET /products/featured — Featured products
│   │       │
│   │       ├── cart/
│   │       │   ├── route.ts                    # GET|POST /cart — View/add to cart
│   │       │   ├── clear/route.ts              # POST /cart/clear — Empty the cart
│   │       │   ├── merge/route.ts              # POST /cart/merge — Merge guest → user cart
│   │       │   └── items/[id]/route.ts         # PATCH|DELETE /cart/items/:id — Update/remove item
│   │       │
│   │       ├── orders/
│   │       │   ├── route.ts                    # GET|POST /orders — List/create orders
│   │       │   └── [id]/route.ts               # GET|PATCH /orders/:id — View/update order
│   │       │
│   │       ├── quotes/
│   │       │   └── route.ts                    # GET|POST /quotes — List/create quote requests
│   │       │
│   │       └── admin/
│   │           └── products/
│   │               ├── route.ts                # GET|POST /admin/products — Admin product CRUD
│   │               └── [id]/route.ts           # PATCH|DELETE /admin/products/:id
│   │
│   ├── components/
│   │   ├── theme-provider.tsx       # Theme context (next-themes), toggle, select components
│   │   │
│   │   ├── providers/
│   │   │   ├── index.ts             # Provider barrel export
│   │   │   └── query-provider.tsx   # TanStack Query client with production defaults
│   │   │
│   │   ├── layout/
│   │   │   ├── index.ts             # Layout barrel export
│   │   │   ├── main-layout.tsx      # Main page layout with header/footer
│   │   │   ├── header.tsx           # Site header with navigation
│   │   │   ├── footer.tsx           # Site footer
│   │   │   ├── mobile-menu.tsx      # Responsive mobile navigation
│   │   │   └── search-bar.tsx       # Global search component
│   │   │
│   │   ├── product/
│   │   │   ├── index.ts             # Product barrel export
│   │   │   ├── product-card.tsx     # Product display card
│   │   │   └── product-grid.tsx     # Responsive product grid
│   │   │
│   │   ├── cart/
│   │   │   ├── index.ts             # Cart barrel export
│   │   │   ├── cart-drawer.tsx      # Slide-out cart panel
│   │   │   ├── cart-item.tsx        # Individual cart line item
│   │   │   ├── cart-summary.tsx     # Cart totals and checkout CTA
│   │   │   └── empty-cart.tsx       # Empty cart state
│   │   │
│   │   ├── checkout/
│   │   │   ├── index.ts             # Checkout barrel export
│   │   │   ├── checkout-provider.tsx # Checkout context and state
│   │   │   ├── checkout-steps.tsx   # Multi-step checkout wizard
│   │   │   └── steps/
│   │   │       ├── cart-review-step.tsx
│   │   │       ├── confirmation-step.tsx
│   │   │       ├── contact-step.tsx
│   │   │       ├── payment-step.tsx
│   │   │       ├── review-step.tsx
│   │   │       ├── shipping-address-step.tsx
│   │   │       └── shipping-method-step.tsx
│   │   │
│   │   ├── quote/
│   │   │   ├── index.ts             # Quote barrel export
│   │   │   └── quote-request-form.tsx # Multi-item quote request form
│   │   │
│   │   ├── admin/
│   │   │   ├── index.ts             # Admin barrel export
│   │   │   ├── admin-sidebar.tsx    # Admin navigation sidebar
│   │   │   ├── admin-stats.tsx      # Dashboard statistics cards
│   │   │   ├── order-table.tsx      # Order management table
│   │   │   ├── product-table.tsx    # Product management table
│   │   │   └── quote-table.tsx      # Quote request table
│   │   │
│   │   ├── navigation/
│   │   │   ├── index.ts             # Navigation barrel export
│   │   │   ├── file-explorer.tsx    # File tree navigation component
│   │   │   └── tree-node.tsx        # Tree node for file explorer
│   │   │
│   │   ├── wizard/
│   │   │   ├── index.ts             # Wizard barrel export
│   │   │   ├── wizard-modal.tsx     # First-visit onboarding modal
│   │   │   ├── wizard-steps.tsx     # Wizard step definitions
│   │   │   └── wizard-trigger.tsx   # Wizard trigger component
│   │   │
│   │   └── ui/                      # shadcn/ui primitives (40+ components)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── toast.tsx
│   │       └── ... (30+ more)
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts           # Responsive breakpoint hook
│   │   ├── use-toast.ts            # Toast notification hook
│   │   ├── use-wizard.ts           # First-visit wizard state hook
│   │   └── use-queries.ts          # TanStack Query hooks for all API endpoints
│   │
│   ├── lib/
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── redis.ts                 # Upstash Redis client + session/lock/presence helpers
│   │   ├── rate-limit.ts            # @upstash/ratelimit wrappers (IP, user, strict)
│   │   ├── api-validation.ts        # Zod validation middleware for API routes
│   │   ├── sanitize.ts              # DOMPurify-based input sanitization (MDX, plain text, URL)
│   │   ├── validations.ts           # Zod schemas for all domain entities
│   │   ├── utils.ts                 # General utility functions (cn, formatters)
│   │   └── navigation-data.ts       # Navigation tree data
│   │
│   ├── stores/
│   │   ├── index.ts                 # Store barrel export
│   │   ├── cart-store.ts            # Zustand cart state (client-side optimistic)
│   │   ├── navigation-store.ts      # Navigation UI state
│   │   ├── search-store.ts          # Search query state
│   │   └── ui-store.ts              # General UI state (modals, drawers)
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces and enums for all domain entities
│   │
│   └── __tests__/
│       ├── setup.ts                 # Vitest global setup (env mocks, console suppression)
│       └── lib/
│           ├── validations.test.ts  # Zod schema tests (contact, cart, checkout, etc.)
│           ├── sanitize.test.ts     # Sanitization function tests (XSS, SQL injection)
│           ├── redis.test.ts        # Redis helper tests (session, locks, presence)
│           ├── rate-limit.test.ts   # Rate limiter tests (allow, deny, fail-open)
│           └── env.test.ts          # Environment variable loading tests
```

---

## Data Flow

### Product Browsing

```
User visits /products
  → Page component renders with TanStack Query (useProducts hook)
  → TanStack Query calls GET /api/products?brand=Apple&page=1
  → API route validates query params with Zod
  → Prisma queries PostgreSQL with filters
  → Response cached by TanStack Query (staleTime: 60s)
  → Subsequent visits use cached data until stale
```

### Add to Cart

```
User clicks "Add to Cart"
  → Zustand cart store updates optimistically (client-side)
  → useMutation calls POST /api/cart with { productId, quantity }
  → API route validates body with addToCartSchema
  → Prisma upserts Cart record (JSON items column)
  → On success: TanStack Query invalidates cart queries
  → On error: Zustand rolls back, toast shows error
```

### Checkout with Inventory Lock

```
User initiates checkout
  → POST /api/inventory/lock { sku, ownerId, ttl: 30 }
  → Redis: SET lock:SKU owner NX EX 30
  → If lock acquired: proceed to payment
  → If lock held: show "item reserved by another user" message
  → After payment or timeout: DELETE /api/inventory/lock releases lock
```

### Rate Limiting Flow

```
Any request to /api/*
  → Edge Middleware intercepts
  → Extract IP from x-forwarded-for header
  → Redis ZRANGEBYSCORE sliding window check (100 req/60s)
  → If under limit: proceed, attach X-RateLimit-* headers
  → If over limit: return 429 with Retry-After header
  → For authenticated users: additional 1000 req/60s check
```

---

## Service Boundaries

| Service | Responsibility | Communication |
|---------|---------------|---------------|
| **Next.js App Router** | Page rendering, API routes, static assets | Internal (same process) |
| **Prisma ORM** | Database queries, migrations, schema management | TCP to PostgreSQL |
| **Upstash Redis** | Session cache, rate limiting, inventory locks, presence | HTTPS REST API (Edge-compatible) |
| **Clerk** | User authentication, session management | HTTPS API + client SDK |
| **Stripe** | Payment processing (optional) | HTTPS API + client SDK |
| **Vercel** | Hosting, CDN, serverless functions, Edge runtime | Deployment platform |
| **Neon** | Serverless PostgreSQL database | TCP (pooled connections) |

### Failure Modes

The application is designed to **degrade gracefully** when external services are unavailable:

| Service Down | Impact | Fallback |
|-------------|--------|----------|
| Redis unavailable | Rate limiting disabled, no session cache | All requests allowed, sessions hit Clerk directly |
| Database unavailable | API routes return 503 | Health endpoint reports "degraded" status |
| Clerk unavailable | Authentication fails | Users cannot sign in; guest flows still work |
| Stripe unavailable | Payments fail | Orders can still be created as quotes |

---

## API Route Map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api` | Public | Root health ping |
| GET | `/api/health` | Public | Full service health check (Redis + DB) |
| GET | `/api/products` | Public | Paginated product listing with filters |
| GET | `/api/products/:id` | Public | Single product detail |
| GET | `/api/products/featured` | Public | Featured products |
| GET | `/api/products/brands` | Public | Brand list with product counts |
| GET | `/api/products/categories` | Public | Category list with product counts |
| GET | `/api/products/device-models` | Public | Device models grouped by brand |
| GET/POST | `/api/cart` | Public | View or add to cart |
| POST | `/api/cart/clear` | Public | Clear cart |
| POST | `/api/cart/merge` | Auth | Merge guest cart into user cart |
| PATCH/DELETE | `/api/cart/items/:id` | Public | Update or remove cart item |
| GET/POST | `/api/orders` | Public | List or create orders |
| GET/PATCH | `/api/orders/:id` | Public | View or update order |
| GET/POST | `/api/quotes` | Public | List or create quote requests |
| POST | `/api/contact` | Public | Submit contact form |
| GET/POST/DELETE | `/api/presence` | Auth | Real-time user presence |
| GET/POST/DELETE | `/api/inventory/lock` | Auth | Inventory lock management |
| GET/POST | `/api/admin/products` | Admin | Admin product CRUD |
| PATCH/DELETE | `/api/admin/products/:id` | Admin | Admin product update/delete |

---

## State Management

The application uses a **dual-layer** state management approach:

**Server State (TanStack Query)** — All data fetched from API routes is managed by TanStack Query. The `QueryProvider` in `src/components/providers/query-provider.tsx` configures production defaults: 60-second stale time, 5-minute garbage collection, exponential retry backoff, and global error toasts for background refetch failures and mutation errors.

**Client State (Zustand)** — Ephemeral UI state (cart drawer open/closed, search query, navigation state) is managed by Zustand stores in `src/stores/`. The cart store provides optimistic updates that are reconciled with the server via TanStack Query mutations.

---

## Security Architecture

### Defence in Depth

```
Layer 1: Vercel Edge Network (DDoS protection, TLS termination)
Layer 2: Next.js Edge Middleware (rate limiting, header injection)
Layer 3: next.config.ts (CSP, HSTS, X-Frame-Options, etc.)
Layer 4: API Route Validation (Zod schemas via withValidation middleware)
Layer 5: Input Sanitization (DOMPurify for rich text, custom sanitizers)
Layer 6: Prisma (parameterised queries — no SQL injection)
Layer 7: Upstash Redis (distributed locks — no race conditions)
```

### Content Security Policy

The CSP is configured in `next.config.ts` and allows only trusted origins for scripts (self, Stripe, Clerk), styles (self, inline), images (self, data, blob, HTTPS), and connections (self, Stripe API, Clerk API, Upstash).

---

## Testing Strategy

| Layer | Tool | Location | Command |
|-------|------|----------|---------|
| Unit | Vitest + Testing Library | `src/__tests__/` | `bun run test` |
| E2E | Playwright | `e2e/` | `bun run test:e2e` |
| Coverage | V8 via Vitest | Generated in `/coverage` | `bun run test:coverage` |

Unit tests cover validation schemas, sanitization functions, Redis helpers, rate limiting logic, and environment variable loading. E2E smoke tests verify that all pages load, API endpoints respond, validation rejects bad input, and security headers are present.
