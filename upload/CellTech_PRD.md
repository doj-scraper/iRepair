**IrepairTechnologies**

B2B Wholesale Parts Portal

+-----------------------------------------------------------------------+
| **PRODUCT REQUIREMENTS DOCUMENT**                                     |
|                                                                       |
| Version 2.0 · Final Specification                                     |
|                                                                       |
| March 2026                                                            |
+-----------------------------------------------------------------------+

  ----------------------- -----------------------------------------------
  **Document Status**     APPROVED -- Ready for Development

  **Project Name**        CellTech Distributor B2B Portal

  **Version**             2.0 -- Final Consolidated Specification

  **Primary Stack**       Next.js · TypeScript · PostgreSQL · Stripe ·
                          Clerk

  **Deployment Target**   Vercel (Frontend) + Supabase/RDS (Database)
  ----------------------- -----------------------------------------------

# **Table of Contents**

TOC \\h \\o \"1-2\"

# **1. Executive Summary**

CellTech Distributor is a high-performance, B2B-first e-commerce
platform built for a cell phone wholesale repair parts distributor that
sources bulk inventory from Chinese suppliers and resells in smaller
quantities to independent retail repair shops across the United States.

This document is the single, authoritative Product Requirements Document
(PRD) for the platform. It supersedes all prior drafts and serves as the
binding specification for design, engineering, QA, and deployment. No
feature, behavior, or technical decision described herein should be
modified without a formal change request and version increment.

+-----------------------------------------------------------------------+
| **Mission**                                                           |
|                                                                       |
| Become the definitive digital sourcing hub for independent repair     |
| shops --- delivering a fast, trustworthy, and friction-free wholesale |
| parts experience that makes every order feel effortless.              |
+-----------------------------------------------------------------------+

# **2. Product Vision & Strategic Goals**

## **2.1 Vision Statement**

A modern, opinionated B2B storefront purpose-built for speed,
discoverability, and trust --- giving repair shop operators the same
polished digital experience they expect from consumer apps, applied to
wholesale sourcing.

## **2.2 Strategic Objectives**

-   Simplify parts discovery via intelligent navigation (File Explorer
    tree, onboarding Wizard, fuzzy header search).

```{=html}
<!-- -->
```
-   Deliver a seamless wholesale ordering experience with guest checkout
    as the default path --- no forced account creation.

-   Enforce a Minimum Order Quantity (MOQ) of 5 units across all SKUs.

-   Provide a quote-request escape hatch for parts not found in the
    catalog.

-   Ensure WCAG 2.1 AA accessibility and full keyboard navigability
    across all interactive elements.

-   Achieve Lighthouse scores of 90+ for Performance and SEO on all core
    pages.

-   Enable secure, PCI-compliant payments via Stripe (cards, Apple Pay,
    Google Pay).

-   Support light/dark theme switching with green as the sole primary
    brand color --- no blue anywhere.

-   Deliver a fully responsive layout across mobile, tablet, and desktop
    breakpoints.

# **3. Target Audience & User Personas**

## **3.1 Primary Persona --- Retail Shop Owner (\"Sarah\")**

-   Owns or manages 1--3 independent repair shops.

-   Places orders weekly; needs fast reorder capability and saved cart
    support.

-   Pain points: bloated catalogs with no clear navigation, unclear
    stock levels, slow checkout for repeat purchases.

-   Success looks like: logging in, finding a battery for a Galaxy S23,
    adding 10 units to cart, and checking out in under 90 seconds.

## **3.2 Secondary Persona --- Shop Technician (\"Mike\")**

-   Searches by model and part type; needs compatibility data and
    technical detail on listings.

-   Pain points: fuzzy-but-not-working search, lack of part
    specifications, no part number lookup.

-   Success looks like: typing \"iphone 14 pro screen\" and landing on
    the correct listing page within one search action.

## **3.3 Internal Persona --- Operations Admin**

-   Manages product catalog (CRUD), order status updates, tracking
    numbers, and quote request responses.

-   Needs role-based dashboard with full visibility into all orders,
    inventory, and incoming quote requests.

-   Pain points: manual catalog updates, no real-time queue for incoming
    requests.

# **4. Functional Requirements**

## **4.1 Authentication & Account Management (Clerk)**

Authentication is handled entirely by Clerk. The platform adopts a
guest-first philosophy --- all browsing, searching, and purchasing is
accessible without an account.

**4.1.1 Guest Access**

-   All product pages, search, and cart functionality are fully
    accessible without login.

-   No pop-up, modal, or gate forces account creation at any point
    during browsing or checkout.

-   Cart data for guests stored in localStorage; merged into the user
    account upon optional post-checkout registration.

**4.1.2 Registered Users**

-   Registration offered once after a successful guest checkout order
    confirmation page (\"Save your details for faster future
    checkout\").

-   Registered users gain: saved address book, payment methods, full
    order history, and saved carts.

-   Social login (Google, Apple) supported via Clerk social providers.

**4.1.3 Role-Based Access Control (RBAC)**

  -----------------------------------------------------------------------
  **Role**              **Capabilities**
  --------------------- -------------------------------------------------
  Guest                 Browse, search, add to cart, checkout, submit
                        quote request.

  Wholesale Customer    All guest capabilities + order history, saved
                        carts, saved addresses, account dashboard.

  Admin                 Full CRUD: products, orders, content pages, quote
                        requests, user management.
  -----------------------------------------------------------------------

**4.1.4 Admin Dashboard**

-   Accessible only to Admin role; protected route with MFA required.

-   Sections: Product Catalog CRUD, Order Queue, Quote Requests Inbox,
    Content Page Editor, User Management.

## **4.2 Navigation Architecture**

The platform provides three complementary navigation pathways, all of
which must remain synchronized with the URL and keyboard-navigable.

**4.2.1 Global Header**

-   Fixed position; always visible on scroll.

-   Components (left to right): Logo/Brand mark → Fuzzy Search Bar →
    Theme Toggle → Cart Icon (live count badge) → User Menu
    (Login/Register or Profile dropdown).

-   Mobile: Logo → Hamburger menu icon → Cart Icon. Search expands as
    overlay on icon tap.

**4.2.2 File Explorer Navigation Module**

-   Collapsible tree-view sidebar rendering the full catalog hierarchy
    recursively.

-   Hierarchy: Brand (Apple, Samsung, Motorola, ...) → Device Model →
    Part Category → Individual Part.

-   Visual affordances: folder icons for branches, file icons for leaf
    nodes, indentation by level, expand/collapse chevrons.

-   Deep link support: navigating to any URL automatically expands the
    tree to the correct node and highlights the active item.

-   Keyboard navigation: Arrow keys move between nodes; Enter
    expands/collapses folders or navigates to product; Escape collapses
    current branch.

-   ARIA roles: tree, treeitem, aria-expanded, aria-selected on all
    nodes.

-   State persisted in Zustand; survives page navigation without
    re-collapsing.

**4.2.3 \"What Are You Looking For Today?\" Wizard**

An onboarding modal triggered on first visit (cookie-gated, not shown
again after dismissal) and accessible from a persistent CTA in the
header/hero.

-   Step 1 --- Intent: \"Are you looking for a Device or a Part?\"

-   Step 2A (Device path): Select Brand → Select Model → View all parts
    for that model.

-   Step 2B (Part path): Select Part Category → Select Subcategory →
    Filter compatible devices/models.

-   All wizard state encoded in URL query parameters for sharing and
    bookmarking (e.g., ?wizard=device&brand=apple&model=iphone-14-pro).

-   Wizard includes its own fuzzy search input as a shortcut at every
    step.

-   Fully keyboard navigable; focus trapped within modal; Escape
    dismisses.

## **4.3 Product Catalog**

**4.3.1 Catalog Data Model**

  -------------------------------------------------------------------------
  **Field**        **Type**      **Description**
  ---------------- ------------- ------------------------------------------
  id               UUID          Primary key.

  sku              VARCHAR       Unique stock-keeping unit identifier.

  name             VARCHAR       Display name (e.g., \"iPhone 14 Pro OLED
                                 Screen Assembly\").

  brand            ENUM          Apple \| Samsung \| Motorola \| Other.

  device_model     VARCHAR       Exact device model (e.g., \"Galaxy S23
                                 Ultra\").

  part_category    ENUM          Screens \| Batteries \| Charging Ports \|
                                 Cameras \| Back Glass \| Other.

  quality_grade    ENUM          OEM \| Aftermarket \| Refurbished.

  price_per_unit   DECIMAL       Wholesale price per unit.

  moq              INTEGER       Minimum order quantity --- defaults to 5
                                 for all SKUs.

  stock_qty        INTEGER       Current inventory count.

  images           JSONB         Array of image URLs (CDN-hosted).

  description      TEXT          Technical description, compatibility
                                 notes.

  weight_g         INTEGER       Weight in grams for shipping calculations.

  is_active        BOOLEAN       Controls listing visibility.
  -------------------------------------------------------------------------

**4.3.2 Listing Page Features**

-   Faceted filter sidebar: Brand, Model, Part Category, Quality Grade,
    Price Range, In Stock Only.

-   Sort options: Relevance, Price Low--High, Price High--Low, Newest,
    Best Seller.

-   Each product card shows: image, name, SKU, unit price, MOQ badge
    (\"MOQ: 5\"), stock status, and Add to Cart button.

-   Low-stock warning badge displayed when quantity falls below a
    configurable threshold (default: 20 units).

**4.3.3 Product Detail Page (PDP)**

-   Full-size image gallery with zoom.

-   Name, SKU, quality grade badge (OEM / Aftermarket), compatibility
    list.

-   Price per unit prominently displayed; unit economics callout (e.g.,
    \"Buy 20+ for \$X/unit\").

-   MOQ enforced: quantity selector defaults to 5; decrement button
    disabled below 5.

-   Stock status: In Stock / Low Stock (N remaining) / Out of Stock.

-   \"Request a Quote\" button visible when item is out of stock.

-   Related parts section (same device model, different part types).

## **4.4 Fuzzy Search**

-   Powered by a server-side full-text search over product name, SKU,
    device model, and part category fields.

-   Handles partial matches, misspellings, and synonyms (e.g., \"galxy
    s21 screen\", \"battery\" matches \"batteries\").

-   Results grouped by relevance; secondary grouping by category.

-   Filter chips appear on results page: Device, Category, Quality
    Grade, Price Range.

-   Debounced at 300ms; shows loading skeleton during fetch.

**4.4.1 Zero Results --- Quote Request Trigger**

+-----------------------------------------------------------------------+
| **Behavior on Zero Results**                                          |
|                                                                       |
| Display message: \"Sorry, we couldn\'t find what you were looking     |
| for. However, we carry an extensive and growing catalog of repair     |
| parts. Contact us for a quote --- we very likely have what you        |
| need.\" Include a pre-filled \"Request a Quote\" button that carries  |
| the search query into the quote form automatically.                   |
+-----------------------------------------------------------------------+

## **4.5 Shopping Cart & Checkout**

**4.5.1 Cart Behavior & MOQ Enforcement**

-   Cart persists across sessions: localStorage for guests;
    database-backed for authenticated users.

-   MOQ = 5 for all products --- hard-enforced on both client and
    server.

-   Adding \< 5 units auto-corrects to 5 with a toast notification:
    \"Minimum order quantity is 5 units.\"

-   Decrement control on cart page is disabled below 5 --- cannot be
    manually typed below minimum.

-   Optimistic UI updates via TanStack Query; no page reload required on
    quantity change.

-   Cart icon in header shows live item count badge, updated in real
    time.

-   Low stock warning inline on cart items when available qty is close
    to order qty.

**4.5.2 Checkout Flow (6 Steps)**

1.  Cart Review --- item list, quantities, MOQ warnings, subtotal.

```{=html}
<!-- -->
```
1.  Contact Information --- name, email, phone (saved if logged in).

2.  Shipping Address --- manual entry with address autocomplete; saved
    addresses for logged-in users.

3.  Shipping Method --- flat rates configured in admin; no real-time
    carrier API.

4.  Payment --- Stripe Elements (card, Apple Pay, Google Pay);
    PCI-compliant; no card data touches the server.

5.  Order Review & Confirmation --- full summary before submit; order
    confirmation email sent on success.

**4.5.3 Guest Checkout & Post-Checkout Registration**

-   No login gate at any checkout step.

-   After order confirmation, a single optional prompt: \"Create an
    account to track your order and reorder faster.\" No pressure;
    easily dismissed.

-   Guest cart data merged into account on registration via cart merge
    API endpoint.

## **4.6 Order Management**

**4.6.1 Customer Order Dashboard**

-   View full order history with status badges: Processing, Shipped,
    Delivered, Cancelled.

-   \"Reorder\" button on any past order repopulates cart with all items
    from that order.

-   Shipment tracking link displayed once admin adds tracking number.

**4.6.2 Admin Order Queue**

-   List view of all orders with status filters, date range picker, and
    keyword search.

-   Order detail view: customer info, line items, address, payment
    status.

-   Admin can update order status and add tracking info inline.

-   Bulk status update for multiple orders.

## **4.7 Quote Request System**

The quote request system provides a critical escape hatch for
out-of-catalog or out-of-stock parts. It is accessible from three entry
points.

**4.7.1 Entry Points**

-   Zero search results page --- pre-filled with the search query.

-   Product detail page --- shown when item is out of stock.

-   Global navigation --- \"Request a Quote\" link always visible in
    header/nav.

**4.7.2 Quote Request Form Fields**

-   Part description / search query (pre-filled where applicable).

-   Quantity needed.

-   Contact name, email, and phone number.

-   Optional: file upload (photo, invoice, or reference document).

-   Optional: additional notes.

**4.7.3 Quote Request Processing**

-   Submitted requests stored in the quotes table in PostgreSQL.

-   Admin receives email notification on submission (via Resend or
    similar transactional email provider).

-   If user is logged in, quote request is linked to their account for
    tracking.

-   Guest submitters receive confirmation email with their request
    details.

-   Admin responds via email; future v2 enhancement: internal messaging
    thread per quote.

## **4.8 Static Content Pages**

  -------------------------------------------------------------------------
  **Page**      **Path**         **Content     **Notes**
                                 Owner**       
  ------------- ---------------- ------------- ----------------------------
  Return Policy /return-policy   Admin         Editable via Markdown CMS
                                               field in admin panel.

  About Us      /about           Admin         Company mission, founding
                                               story, why choose us.

  Terms &       /terms           Admin (Legal) Binding legal text;
  Conditions                                   version-controlled.

  Contact Us    /contact         Admin         Contact form + email +
                                               phone. Form submissions
                                               emailed to admin.

  FAQ           /faq             Admin         Accordion-style; addresses
                                               common B2B questions.
  -------------------------------------------------------------------------

# **5. UI/UX Requirements**

## **5.1 Design System**

**5.1.1 Color Palette**

  ------------------------------------------------------------------------------
  **Token**                **Hex Value**         **Usage**
  ------------------------ --------------------- -------------------------------
  \--color-primary         #059669 (emerald-600) Buttons, links, active states,
                                                 badges. NO blue anywhere in the
                                                 UI.

  \--color-primary-dark    #064E3B (emerald-900) Headers, nav backgrounds,
                                                 dark-mode surfaces.

  \--color-primary-light   #D1FAE5 (emerald-100) Hover states, backgrounds,
                                                 callout boxes.

  \--color-neutral-900     #111827               Body text (light mode).

  \--color-neutral-50      #F9FAFB               Page background (light mode).

  \--color-error           #DC2626               Form errors, destructive
                                                 actions.

  \--color-success         #16A34A               Success states, confirmation
                                                 messages.

  \--color-warning         #D97706               Low stock warnings, MOQ
                                                 notices.
  ------------------------------------------------------------------------------

**5.1.2 Typography Hierarchy**

  ----------------------------------------------------------------------------
  **Level**   **Element**   **Size /         **Usage**
                            Weight**         
  ----------- ------------- ---------------- ---------------------------------
  Display     h1            2.25rem / 700    Page titles, hero sections.

  Title       h2            1.5rem / 600     Section headings.

  Subtitle    h3            1.125rem / 600   Card titles, subsection headings.

  Body        p             1rem / 400       Standard body copy.

  Caption     small         0.875rem / 400   Labels, metadata, helper text.

  Overline    span          0.75rem / 500    Category labels, badge text.
                            uppercase        
  ----------------------------------------------------------------------------

**5.1.3 Theme Switching**

-   Light mode is the default; dark mode toggle in header persists to
    localStorage.

-   System preference (prefers-color-scheme) applied on first visit
    before any explicit toggle.

-   All color tokens defined as CSS custom properties in :root; dark
    overrides in \[data-theme=\"dark\"\].

-   No \"blue\" token exists anywhere in the design system --- any
    default Tailwind blue classes must be overridden.

## **5.2 Accessibility (WCAG 2.1 AA)**

-   All interactive elements have descriptive aria-label or
    aria-labelledby attributes.

-   Focus indicators: 2px solid outline on all focusable elements, never
    hidden with outline: none.

-   Skip link: \"Skip to main content\" as the first focusable element
    on every page.

-   Semantic HTML: nav, main, section, article, header, footer used
    correctly throughout.

-   Color contrast ratios meet WCAG AA: minimum 4.5:1 for normal text,
    3:1 for large text.

-   All form inputs have associated label elements; error messages
    linked via aria-describedby.

-   Icon-only buttons have aria-label text; decorative images have
    alt=\"\".

-   Modal dialogs: focus trapped inside when open; restored to trigger
    on close; Escape closes.

-   File Explorer tree: ARIA roles tree, treeitem, aria-expanded,
    aria-selected enforced.

## **5.3 Responsive Design**

  -----------------------------------------------------------------------
  **Breakpoint**   **Tailwind    **Behavior**
                   Prefix**      
  ---------------- ------------- ----------------------------------------
  \< 640px         default       Single-column layout. Hamburger nav.
  (Mobile)                       Bottom-sheet cart. Full-width inputs.

  640px -- 1024px  sm: / md:     Two-column product grid. Collapsible
  (Tablet)                       sidebar. Sticky header.

  \> 1024px        lg: / xl:     Three/four-column grid. Persistent
  (Desktop)                      sidebar. Expanded header with search.
  -----------------------------------------------------------------------

## **5.4 SaaS Minimal Design Principles**

-   Whitespace-first: generous padding and spacing; no visual clutter.

-   Flat, borderless components with subtle shadows over heavy borders.

-   Green CTAs only --- secondary actions use ghost/outline variants.

-   Icon set: Heroicons (outline weight) for all UI icons; consistent
    24px base size.

-   Micro-interactions: smooth 150ms transitions on hover/focus;
    skeleton loaders instead of spinners where possible.

# **6. SEO Strategy**

## **6.1 Technical SEO**

-   Next.js App Router used for all catalog and product pages --- full
    SSR/SSG ensures content is crawler-accessible.

-   Dynamic metadata: every product page and category page generates
    unique \<title\>, \<meta description\>, and Open Graph tags at
    render time from the database.

-   Sitemap: dynamically generated at /sitemap.xml by a Next.js Route
    Handler that enumerates all active products and categories.

-   Robots.txt: /robots.txt permits crawling of all catalog routes;
    disallows /admin, /api, /checkout, /account.

-   Canonical URLs enforced on all pages to prevent duplicate content on
    filtered views.

-   Structured Data (JSON-LD): Product schema on PDPs (price,
    availability, SKU) and Organization schema on homepage.

## **6.2 Performance & Core Web Vitals**

-   Target Lighthouse scores: Performance 90+, SEO 90+, Accessibility
    90+, Best Practices 90+.

-   All images served via next/image with automatic WebP conversion,
    responsive srcset, and lazy loading.

-   Critical CSS inlined; non-critical CSS deferred.

-   Largest Contentful Paint (LCP) target: \< 2.5s on 4G.

-   Cumulative Layout Shift (CLS) target: \< 0.1 (images always have
    explicit width/height).

-   First Input Delay (FID) / Interaction to Next Paint (INP) target: \<
    200ms.

# **7. Security Framework**

## **7.1 Authentication Security**

-   Clerk manages all authentication; no passwords stored in application
    database.

-   MFA: optional for standard users; mandatory for Admin role accounts.

-   Session management: HTTP-only, Secure cookies; sessions invalidated
    on password reset.

-   RBAC enforced server-side on all Next.js API Routes and Server
    Actions --- client-side RBAC is decorative only.

## **7.2 Application Security**

-   Rate limiting on all public API routes (Auth, Checkout, Quote
    Submit, Search) using Upstash Redis via Vercel Edge Config.

-   Zod schema validation on every API input --- malformed or unexpected
    payloads are rejected with 400 before business logic executes.

-   Content Security Policy (CSP) headers set via Next.js middleware:
    strict-dynamic, no inline scripts.

-   HTTPS enforced via Vercel; HSTS preload enabled.

-   SQL Injection prevention: Drizzle ORM uses parameterized queries
    exclusively.

-   XSS prevention: React\'s JSX auto-escaping + CSP;
    dangerouslySetInnerHTML never used.

-   CSRF protection: SameSite=Strict on session cookies; Clerk handles
    CSRF tokens for mutations.

## **7.3 Data Privacy**

-   No credit card numbers ever stored or logged --- Stripe handles
    tokenization.

-   PII fields in PostgreSQL encrypted at rest using provider-level
    encryption (Supabase/RDS).

-   File uploads in quote requests: stored in S3-compatible object
    storage (not served from application server); scanned for malware
    before admin access.

# **8. Testing Framework**

The project follows a \"Shift-Left\" testing strategy. All tests must
pass on a pull request before merge is permitted.

  ------------------------------------------------------------------------
  **Test Type**   **Tool**           **Coverage    **Scope**
                                     Target**      
  --------------- ------------------ ------------- -----------------------
  Unit Tests      Vitest             80%           Utilities, helpers, Zod
                                                   schemas, price
                                                   calculation logic, MOQ
                                                   enforcement.

  Component Tests Vitest + React     70%           Product cards, File
                  Testing Library                  Explorer nodes, Wizard
                                                   steps, Cart item row,
                                                   MOQ toast.

  Integration     Vitest + MSW       Key flows     API routes, Drizzle
  Tests                                            queries, auth
                                                   middleware, Zod
                                                   validation boundaries.

  E2E Tests       Playwright         Critical      User signup, Login, Add
                                     paths         to Cart (MOQ), Full
                                                   Checkout, Wizard flow,
                                                   Quote Request.

  Accessibility   Axe-core via       WCAG 2.1 AA   Automated audit on
                  Playwright                       homepage, PDP, cart,
                                                   checkout, wizard, and
                                                   search results pages.

  Visual          Playwright         Key UI pages  Homepage, PDP, Cart,
  Regression      Snapshots                        Checkout Step 1, Theme
                                                   toggle (light/dark).
  ------------------------------------------------------------------------

# **9. CI/CD Pipeline**

## **9.1 On Pull Request**

6.  pnpm install --- install dependencies from lockfile.

7.  ESLint --- fail on any TypeScript error or lint violation (strict
    mode).

8.  Vitest --- run all unit and component tests; block merge on failure.

9.  Next.js Build --- validate that the production build compiles
    without error.

10. Vercel Preview Deploy --- generate unique preview URL for QA and
    stakeholder review.

## **9.2 On Merge to main**

11. Playwright E2E --- run full critical path suite against the preview
    build.

12. Axe Accessibility Audit --- automated WCAG check; fail deployment if
    new violations introduced.

13. Drizzle Migrations --- apply database migrations to staging;
    validate; then apply to production.

14. Vercel Production Deploy --- automatic deployment to production CDN.

15. Slack/Email Notification --- deployment summary to team channel.

+-----------------------------------------------------------------------+
| **Branch Protection Rules**                                           |
|                                                                       |
| main branch requires: (1) at least 1 approving review, (2) all CI     |
| checks green, (3) no unresolved comments. Direct pushes to main are   |
| blocked.                                                              |
+-----------------------------------------------------------------------+

# **10. Database Architecture & Strategy**

## **10.1 Schema Overview**

PostgreSQL hosted on Supabase (preferred) or AWS RDS. Drizzle ORM
provides full type-safety between schema definitions and TypeScript
query results.

**10.1.1 Core Tables**

  --------------------------------------------------------------------------
  **Table**        **Key Fields**            **Description**
  ---------------- ------------------------- -------------------------------
  products         id, sku, name, brand,     Product catalog. Indexed on
                   device_model,             brand, device_model,
                   part_category,            part_category, is_active.
                   quality_grade, price,     
                   moq, stock_qty, is_active 

  orders           id, user_id (nullable),   Order records. user_id nullable
                   status, subtotal,         for guest orders.
                   shipping_method,          
                   tracking_number,          
                   created_at                

  order_items      id, order_id, product_id, Line items per order. Quantity
                   quantity, unit_price      enforced \>= MOQ at insert.

  users            id (Clerk UID), email,    Mirrors Clerk user data for
                   role, created_at          RBAC and relational joins.

  addresses        id, user_id, name,        Saved shipping addresses for
                   street, city, state, zip, registered users.
                   country, is_default       

  carts            id, user_id (nullable),   Persistent carts. Session-based
                   session_id, items         for guests; user-based for auth
                   (JSONB), updated_at       users.

  quote_requests   id, user_id (nullable),   Quote request submissions.
                   part_description,         
                   quantity, contact_email,  
                   contact_phone, file_url,  
                   status, created_at        

  content_pages    id, slug, title, body_md, CMS-managed static pages
                   updated_at                (About, T&C, etc.).
  --------------------------------------------------------------------------

## **10.2 Backup & Recovery**

-   Point-in-Time Recovery (PITR): enabled; restore to any second within
    the last 30 days.

-   Daily automated snapshots stored in S3-compatible object storage
    with 90-day retention.

-   Recovery Time Objective (RTO): \< 1 hour.

-   Recovery Point Objective (RPO): \< 5 minutes.

## **10.3 Read Performance**

-   Read replica provisioned for high-read endpoints: product listings,
    search, category pages.

-   Primary instance handles all writes: orders, cart updates, quote
    submissions.

-   Full-text search index on products.name, products.device_model using
    PostgreSQL tsvector.

-   Composite indexes on (brand, device_model, part_category, is_active)
    for faceted filtering.

# **11. Full Technology Stack**

  ------------------------------------------------------------------------
  **Layer**       **Technology**        **Purpose**
  --------------- --------------------- ----------------------------------
  Framework       Next.js (App Router)  Full-stack React framework: SSR,
                                        SSG, API Routes, Server Actions.

  Language        TypeScript (strict    End-to-end type safety. Strict
                  mode)                 null checks enforced everywhere.

  Build Tool      Vite (dev) / Next.js  Instant HMR in development;
                  (prod)                optimized production builds.

  Styling         Tailwind CSS          Utility-first; green primary
                                        palette; no blue tokens.

  Server State    TanStack Query        Caching, background sync,
                                        optimistic updates for cart and
                                        inventory.

  Client State    Zustand               File Explorer tree state, Wizard
                                        step state, UI toggles.

  ORM             Drizzle ORM           Type-safe SQL; minimal overhead;
                                        migrations via drizzle-kit.

  Validation      Zod                   Schema validation at all API
                                        boundaries (shared client +
                                        server).

  Auth            Clerk                 Authentication, MFA, RBAC, social
                                        login, session management.

  Payments        Stripe                Cards, Apple Pay, Google Pay;
                                        PCI-compliant; webhook order sync.

  Database        PostgreSQL            Primary relational store. Hosted
                                        on Supabase or AWS RDS.

  Unit Testing    Vitest + React        Fast unit and component tests.
                  Testing Library       

  E2E Testing     Playwright            Cross-browser critical path
                                        testing + accessibility audits.

  CI/CD           GitHub Actions +      Automated test, build, migrate,
                  Vercel                and deploy pipeline.

  Search          PostgreSQL Full-Text  tsvector index; fuzzy matching
                  Search                with pg_trgm extension.

  Email           Resend                Transactional emails: order
                                        confirmations, quote
                                        notifications.

  File Storage    Supabase Storage / S3 Quote request file uploads;
                                        product images.

  Type Safety     tRPC (optional, v2)   End-to-end typesafe API client ---
  (API)                                 evaluate after initial launch.
  ------------------------------------------------------------------------

# **12. Non-Functional Requirements**

## **12.1 Performance**

-   Page load time \< 2s on 3G network (measured via Lighthouse).

-   Cart updates feel instantaneous: optimistic updates with TanStack
    Query rollback on error.

-   Product images served from CDN via next/image; no unoptimized images
    in production.

-   Server responses for product listing pages \< 500ms p95.

## **12.2 Scalability**

-   Vercel serverless functions auto-scale with demand.

-   Database indexes prevent full-table scans on common query patterns.

-   TanStack Query cache reduces redundant API calls for repeated
    navigation.

-   Static product category pages pre-rendered (ISR) with 60-second
    revalidation.

## **12.3 Maintainability**

-   TypeScript strict mode: zero any types permitted in committed code.

-   ESLint + Prettier enforced via Husky pre-commit hooks.

-   All components co-located with their test files
    (ComponentName.test.tsx).

-   Environment variables documented in .env.example; no secrets in
    source code.

-   Drizzle migration files committed to repository and applied
    automatically by CI.

# **13. Implementation Roadmap**

  -----------------------------------------------------------------------------
  **Phase**    **Weeks**   **Deliverables**                **Exit Criteria**
  ------------ ----------- ------------------------------- --------------------
  Phase 1      1 -- 3      Repo setup, GitHub Actions CI,  All CI checks green.
  Foundation               Vercel environments (preview +  Auth login/logout
                           production), PostgreSQL         working. DB
                           provisioning with PITR, Drizzle accessible from app.
                           ORM schemas, Clerk auth (incl.  
                           MFA for admin), seed script     
                           structure, .env.example.        

  Phase 2      4 -- 6      Product catalog CRUD (admin),   File Explorer
  Catalog &                File Explorer tree component,   navigates full
  Nav                      \"What Are You Looking For?\"   hierarchy. Search
                           Wizard modal, Fuzzy search      returns fuzzy
                           (PostgreSQL full-text), Product results. PDP renders
                           listing page with faceted       with correct data.
                           filters, Product detail page    
                           (PDP), SEO metadata pipeline.   

  Phase 3      7 -- 8      Cart (guest + auth), MOQ        End-to-end checkout
  Commerce                 enforcement (client + server),  test passing in
                           Checkout flow (6 steps), Stripe Playwright. Stripe
                           integration (card + Apple Pay + test webhook
                           Google Pay), Order              processed. MOQ
                           confirmation + email, Order     enforced at all
                           history dashboard, Guest cart   layers.
                           merge on registration.          

  Phase 4      9           Quote request system (all 3     Quote form submits
  Quote &                  entry points), Static content   and admin receives
  Content                  pages (Return Policy, About,    email. All content
                           T&C, FAQ, Contact), Admin order pages render. Theme
                           queue + quote inbox, Quote      toggle persists.
                           email notifications, Theme      
                           switch (light/dark).            

  Phase 5 QA & 10          Full Playwright E2E suite, Axe  Lighthouse 90+. Zero
  Launch                   accessibility audit (WCAG 2.1   critical
                           AA), Visual regression          accessibility
                           baseline, Lighthouse audit (90+ violations. All E2E
                           all categories), Performance    tests green. Live on
                           optimization pass, DNS          production domain.
                           cut-over, Production monitoring 
                           setup.                          
  -----------------------------------------------------------------------------

# **14. KPIs & Success Metrics**

  -----------------------------------------------------------------------
  **Metric**            **Target**         **Measurement Method**
  --------------------- ------------------ ------------------------------
  Conversion Rate       \> 3% (sessions to Analytics (Plausible / GA4)
                        completed orders)  --- orders / unique sessions.

  Average Order Value   Track baseline in  Order database aggregate.
                        Month 1; target    
                        10% growth by      
                        Month 3            

  Search Success Rate   \> 60% of searches Search analytics event
                        result in a        tracking.
                        product page click 

  Quote Conversion Rate \> 20% of quote    Quote request table status
                        requests lead to a tracking.
                        placed order       

  User Retention        \> 40% of          Order history; cohort
                        customers reorder  analysis.
                        within 90 days     

  Lighthouse            \> 90 on all core  Automated Lighthouse in CI
  Performance           pages              pipeline.

  Accessibility Score   Zero critical WCAG Axe-core via Playwright on
                        2.1 AA violations  every deployment.

  Page Load Time        \< 2s on 3G (LCP   Lighthouse; Vercel Web
                        \< 2.5s)           Analytics.

  Uptime                \> 99.9%           Uptime monitoring (Better
                                           Uptime or similar).
  -----------------------------------------------------------------------

# **15. Decisions Log & Assumptions**

## **15.1 Resolved Decisions**

  ------------------------------------------------------------------------
  **Decision**       **Resolution**           **Rationale**
  ------------------ ------------------------ ----------------------------
  Guest checkout vs. Guest checkout is the    Reducing friction increases
  required login     default; account         conversion rate; B2B buyers
                     creation is optional     resist forced registration.
                     post-order only.         

  Minimum Order      MOQ = 5 units for all    Wholesale economics require
  Quantity           products, hard-enforced  a minimum viable order size.
                     on client and server.    

  Shipping rate      Flat rates configured    Reduces scope and external
  calculation        manually in admin; no    dependencies. Can be added
                     carrier API integration  in v2.
                     in v1.                   

  Quote /            Implemented:             Critical for capturing
  negotiation        zero-results trigger,    demand that the current
  feature            PDP out-of-stock         catalog does not cover.
                     trigger, and global nav  
                     link.                    

  Primary color      Green only --- no blue.  Brand differentiation;
  constraint         All default Tailwind     consistent visual identity.
                     blue classes overridden  
                     or unused.               

  Search technology  PostgreSQL full-text     Avoids adding
                     search with pg_trgm for  Algolia/Elasticsearch
                     fuzzy matching in v1.    dependency; revisit if
                                              result quality degrades at
                                              scale.

  ORM selection      Drizzle ORM (over        Minimal overhead, SQL-close
                     Prisma).                 API, faster cold starts on
                                              serverless.

  Database hosting   Supabase preferred; AWS  Supabase provides PITR, read
                     RDS as alternative if    replicas, and built-in
                     infrastructure team      Storage out of the box.
                     prefers AWS ecosystem.   

  tRPC adoption      Deferred to v2           Next.js Server Actions + Zod
                     evaluation.              provide sufficient type
                                              safety for v1 without adding
                                              a new abstraction.
  ------------------------------------------------------------------------

## **15.2 Assumptions**

-   Initial product data will be provided as a CSV/Excel export and
    seeded via a migration script.

-   Inventory sync with an external ERP is out of scope for v1; admin
    updates stock manually via dashboard.

-   Wholesale pricing is flat per SKU for all customers in v1;
    tiered/negotiated pricing is a v2 feature.

-   The platform will launch in English only; internationalization
    (i18n) is a post-v1 consideration.

-   The company has an existing Stripe account; merchant configuration
    is handled outside this project scope.

-   Email transactional service (Resend) credentials are provided by the
    business.

# **16. Appendix**

## **16.1 Project Directory Structure (Recommended)**

+-----------------------------------------------------------------------+
| celltech-portal/                                                      |
|                                                                       |
| ├── app/ \# Next.js App Router                                        |
|                                                                       |
| │ ├── (shop)/ \# Public storefront routes                             |
|                                                                       |
| │ │ ├── page.tsx \# Homepage                                          |
|                                                                       |
| │ │ ├── products/ \# Listing + PDP pages                              |
|                                                                       |
| │ │ ├── cart/ \# Cart page                                            |
|                                                                       |
| │ │ ├── checkout/ \# Multi-step checkout                              |
|                                                                       |
| │ │ └── \[slug\]/ \# Static content pages                             |
|                                                                       |
| │ ├── (auth)/ \# Clerk auth routes                                    |
|                                                                       |
| │ ├── admin/ \# Admin dashboard (RBAC protected)                      |
|                                                                       |
| │ └── api/ \# API Route Handlers                                      |
|                                                                       |
| ├── components/ \# Shared UI components                               |
|                                                                       |
| │ ├── catalog/ \# ProductCard, FileExplorer, Wizard                   |
|                                                                       |
| │ ├── cart/ \# CartItem, CartDrawer                                   |
|                                                                       |
| │ ├── checkout/ \# CheckoutSteps, AddressForm                         |
|                                                                       |
| │ ├── layout/ \# Header, Footer, Sidebar                              |
|                                                                       |
| │ └── ui/ \# Design system primitives                                 |
|                                                                       |
| ├── db/ \# Drizzle schema + migrations                                |
|                                                                       |
| │ ├── schema/ \# Table definitions                                    |
|                                                                       |
| │ └── migrations/ \# Versioned migration files                        |
|                                                                       |
| ├── lib/ \# Shared utilities                                          |
|                                                                       |
| │ ├── validations/ \# Zod schemas (shared client+server)              |
|                                                                       |
| │ ├── stripe.ts \# Stripe client                                      |
|                                                                       |
| │ └── search.ts \# Full-text search helpers                           |
|                                                                       |
| ├── tests/ \# Test files                                              |
|                                                                       |
| │ ├── unit/ \# Vitest unit tests                                      |
|                                                                       |
| │ ├── components/ \# React Testing Library tests                      |
|                                                                       |
| │ └── e2e/ \# Playwright E2E tests                                    |
|                                                                       |
| └── .github/workflows/ \# CI/CD GitHub Actions                        |
+-----------------------------------------------------------------------+

## **16.2 Environment Variables Reference (.env.example)**

+-----------------------------------------------------------------------+
| \# Database                                                           |
|                                                                       |
| DATABASE_URL=postgresql://\...                                        |
|                                                                       |
| \# Clerk Authentication                                               |
|                                                                       |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk\_\...                            |
|                                                                       |
| CLERK_SECRET_KEY=sk\_\...                                             |
|                                                                       |
| \# Stripe Payments                                                    |
|                                                                       |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk\_\...                           |
|                                                                       |
| STRIPE_SECRET_KEY=sk\_\...                                            |
|                                                                       |
| STRIPE_WEBHOOK_SECRET=whsec\_\...                                     |
|                                                                       |
| \# Email (Resend)                                                     |
|                                                                       |
| RESEND_API_KEY=re\_\...                                               |
|                                                                       |
| \# File Storage                                                       |
|                                                                       |
| SUPABASE_URL=https://\...                                             |
|                                                                       |
| SUPABASE_SERVICE_ROLE_KEY=\...                                        |
|                                                                       |
| \# Rate Limiting                                                      |
|                                                                       |
| UPSTASH_REDIS_REST_URL=https://\...                                   |
|                                                                       |
| UPSTASH_REDIS_REST_TOKEN=\...                                         |
+-----------------------------------------------------------------------+

*END OF DOCUMENT · CellTech Distributor PRD v2.0 · APPROVED FOR
DEVELOPMENT*
