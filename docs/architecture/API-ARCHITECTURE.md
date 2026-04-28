# API Architecture — `/api/v1/public`, `/client`, `/admin`

This document defines the **routing model**, guard stacks, Swagger layout, envelopes, pagination conventions, RBAC rollout, and **target-state endpoint map** for the platform.

## 1. Global prefix

NestJS **`app.setGlobalPrefix('api/v1')`** applies to all route controllers registered on the HTTP adapter, except **`exclude`** entries documented below.

**Excluded from the global prefix** (paths stay as `@Controller(...)` declares; no duplication):

| Area | Approx. URLs | Reason |
|------|----------------|--------|
| App root | `GET /` | Health / heartbeat style root |
| `health` | `GET`, `HEAD /health` | Infra probes |
| `payments` | `/payments/*` | Existing Stripe webhook + REST surface |
| `orders` | `/orders/*` | Legacy/order demo endpoints |
| `upload` | `/upload`, `/upload/*` | File upload shim |
| `routers` | `/routers/*` | Admin router catalog CRUD |
| `idempotency` | `/idempotency/*` | Idempotency (if routes added) |
| `api/chat` | `/api/chat/*` | Chat shim (outside `api/v1`) |

Cookies for refresh rotation use **`path: '/api/v1/auth'`** — compatible with **`@Controller('auth')` + global prefix** → **`/api/v1/auth`**.

## 2. Three surface groups

| Prefix | Auth | Purpose |
|--------|------|---------|
| **`/api/v1/public/*`** | None on list/index; optional JWT on selected **detail** routes for future personalization (`JwtOptionalAuthGuard`) | Marketing, SSR/SEO, catalogs |
| **`/api/v1/client/*`** | `JwtAuthGuard` required at controller scope | Logged-in end users: profile, “me”, bookings, favorites |
| **`/api/v1/admin/*`** | `JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)` at controller scope | CRM/CMS, moderation, dashboards |

Technical endpoints (Stripe webhook, OTP, standalone upload) may remain outside **`/public|client|admin`** until migrated.

### 2.1 Module layout

Per feature module:

- **One `*Service` + repositories** — business logic is shared.
- **Up to three controllers**: `*.public.controller.ts`, `*.client.controller.ts`, `*.admin.controller.ts` (omit what does not apply).

Pilot implementation (completed): **`blog`**, **`blog-category`**, **`blog-tag`**.

## 3. Guards

### `JwtAuthGuard` / optional JWT

- **Public lists**: no guard.
- **Public detail** (hybrid SEO + personalization): **`JwtOptionalAuthGuard`** — invalid/expired Bearer is treated as anonymous.
- **Client/admin**: **`JwtAuthGuard`**; `request.user`: `{ userId, username, role?, roles[] }`.

### `RolesGuard` + `@Roles(...)`

Behavior:

- When **`@Roles(...)` metadata is absent** AND the request URL path resolves to **`/api/v1`** + **`/admin/`**, **access is denied** (prevents forgetting `@Roles()` on admin trees). Also denies when URL **ends with** `/admin` (single segment).

- Otherwise, missing **`@Roles()`** ⇒ **allowed** for routes that rely on JWT-only semantics (migrate those carefully toward explicit roles where needed).

Pilot admin controllers annotate **`@Roles([Role.ADMIN])`** at **class level** so every handler inherits the requirement.

## 4. Roles

Canonical enum: **`src/enum/role.enum.ts`**

- `user`, `admin`, `super_admin` (strings stored on user document and JWT payload).

## 5. Future granular RBAC (metadata only today)

- **`@ApiCode('blog.admin.create')`** — `SetMetadata` key for a future **`ApiPermissionGuard`** that checks resolved API codes from Mongo + Redis (see `PermissionService.resolvePermissions`).

## 6. Swagger (non-production)

| URL | Contents |
|-----|----------|
| `/api/docs/all` | Full OpenAPI |
| `/api/docs/public` | Paths starting with `/api/v1/public` |
| `/api/docs/client` | Paths starting with `/api/v1/client` |
| `/api/docs/admin` | Paths starting with `/api/v1/admin` |

Bearer security scheme name: **`bearer`**.

## 7. Response envelope (success)

Global interceptor wraps successful handler results:

```json
{
  "statusCode": 200,
  "status": true,
  "timestamp": "2026-04-28T08:00:00.000Z",
  "data": { },
  "message": "success"
}
```

## 8. Error envelope

Global filter:

```json
{
  "statusCode": 400,
  "status": false,
  "timestamp": "2026-04-28T08:00:00.000Z",
  "path": "/api/v1/...",
  "message": "Human-readable message or joined validation messages",
  "data": null
}
```

## 9. Pagination (convention for new docs / new endpoints)

**Query (preferred for new work):** `page` (1-based), `limit` (max cap e.g. 100).

**Response list shape (target):**

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0,
  "totalPages": 0
}
```

Existing modules may still return feature-specific shapes until normalized.

## 10. Migration recipe (per module)

1. Move public reads to **`@Controller('public/<resource>')`** (no `api/v1` in decorator string; global prefix adds it).
2. Move user-scoped routes to **`@Controller('client/<resource>')`**.
3. Move staff routes to **`@Controller('admin/<resource>')`** with class-level **`@UseGuards(JwtAuthGuard, RolesGuard)`** + **`@Roles([Role.ADMIN])`**.
4. Add **`@ApiTags`**, **`@ApiCode`** on admin mutations.
5. Remove old mixed controller file.
6. Update FE and integration tests; remove deprecated paths in the same release for modules that do not use dual-mount (pilot style).

## 11. Target-state route map (by controller)

Full URLs = **`/api/v1` +** controller path + route path. **Excluded** routes omit the `api/v1` prefix where listed in §1.

### Pilot — implemented under `public` / `admin`

| Domain | Target base (under `/api/v1`) | Notes |
|--------|-------------------------------|--------|
| Blog posts | `public/blogs`, `admin/blogs` | Replaces `blog-posts` |
| Blog categories | `public/blog-categories`, `admin/blog-categories` | |
| Blog tags | `public/blog-tags`, `admin/blog-tags` | |

### Remaining modules — target destination (to migrate)

| Current logical area | Target `public` | Target `client` | Target `admin` | Notes / also |
|---------------------|-----------------|------------------|----------------|--------------|
| Auth | `auth` login/register/refresh/logout (under `/api/v1`) | `client/auth` → `me`, `logout-all` (future) | — | Refresh cookie path stays `/api/v1/auth` |
| Users | public directory reads if any | `client/users` profile | `admin/users` CRUD | Today has unsafe unguarded mutations — fix when migrating |
| Provinces | `public/provinces` | — | `admin/provinces` | Reads public; writes admin |
| Hotels / rooms / tours | `public/hotels`, `public/rooms`, `public/tours` | — | `admin/hotels`, `admin/rooms`, `admin/tours` | Optional JWT on detail only; mutations today unguarded — close on admin move |
| Room / tour inventory | `public/room-inventories`, `public/tour-inventory` | — | `admin/room-inventories`, `admin/tour-inventory` | Block/release/ensure → admin-only |
| Bookings (room) | limited public lookup if product needs | `client/bookings` | `admin/bookings` | Many ops today unguarded |
| Tour bookings | public `by-code` | `client/tour-bookings` | `admin/tour-bookings` | Payment/receipt paths → admin or signed |
| Favorites | — | `client/favorites` | `admin/favorites` | Admin list already `favorites/admin` → `admin/favorites` |
| Reviews | `public/reviews` | `client/reviews` | `admin/reviews` | Moderation admin |
| Tour guides | `public/tour-guides` | `client/tour-guides` (register, my-profile) | `admin/tour-guides` | |
| Notifications | — | `client/notifications` | — | |
| Payments | — | `client/payments` | — | Webhook stays `/payments/webhook/stripe` (excluded) |
| Media / upload | `public/media` upload may move to admin-only | — | `admin/media` | Today public upload — tighten later |
| OTP | `otp` under `/api/v1` | — | — | |
| Product | — | `client/product` if retail | `admin/product` | Today class-level JWT+Roles |
| Audit logs | — | — | `admin/audit-logs` | |
| Analytics | — | — | `admin/dashboard` | Add guards when migrating |
| RBAC (`api-permissions`, `api-roles`, `router-roles`, `roles`, `routers`) | — | — | `admin/...` | Today unguarded — **must** be admin-only |
| Chat | — | `client/chat` (future) | — | Current `api/chat` excluded |
| Health | `/health` | — | — | Excluded |
| Orders / payment (legacy) | — | — | — | See excluded paths |

This table is the **north star**; implementation is incremental after the blog pilot.

---

*Last updated: API split pilot (blog, categories, tags) + global prefix + Swagger filters.*
