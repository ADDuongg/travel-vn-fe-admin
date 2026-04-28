# FE Admin API — internal dashboard

API for the **internal admin SPA** (hotels/tours CMS, bookings, users, RBAC, audit). All **mutating** catalog operations and moderation live here as routes move to **`/api/v1/admin/*`**.

Companion: [FE-CLIENT-API.md](./FE-CLIENT-API.md) — public site & end users.

Architecture: [API-ARCHITECTURE.md](../architecture/API-ARCHITECTURE.md).

---

## 1. Base URL

Same host and **`/api/v1`** prefix as the public API. Full admin resources are being migrated to:

```
https://<host>/api/v1/admin/<resource>/...
```

**OpenAPI (dev only):** `GET /api/docs/admin` — only paths under **`/api/v1/admin`**.

---

## 2. Authentication

Use the same **`POST /api/v1/auth/login`** flow as the client doc.

**Requirement:** `account.roles` (or JWT `roles` claim) must include **`admin`** for staff routes.

| HTTP | Meaning |
|------|---------|
| **401** | Missing or invalid JWT |
| **403** | Valid JWT but insufficient role / guard denied |

---

## 3. Success & error envelopes

Same as [FE-CLIENT-API.md §3–4](./FE-CLIENT-API.md). Use **`response.data`** and surface **`message`** for toasts; log **`path`** + correlation id on failures.

---

## 4. Pagination

Same convention as the client doc (`page`, `limit`, list metadata in `data`).

---

## 5. Pilot admin routes (implemented)

### Blog posts

| Method | Path | Body / notes |
|--------|------|----------------|
| GET | `/api/v1/admin/blogs` | Query: admin list filters (`BlogPostAdminQueryDto`) |
| GET | `/api/v1/admin/blogs/:id` | Edit form |
| POST | `/api/v1/admin/blogs` | `CreateBlogPostDto` |
| PATCH | `/api/v1/admin/blogs/:id` | `UpdateBlogPostDto` |
| PATCH | `/api/v1/admin/blogs/:id/publish` | — |
| PATCH | `/api/v1/admin/blogs/:id/unpublish` | — |
| DELETE | `/api/v1/admin/blogs/:id` | Soft delete |

```http
GET /api/v1/admin/blogs?page=1&limit=20&status=draft
Authorization: Bearer <access_token>
```

### Blog categories

| POST | `/api/v1/admin/blog-categories` | `CreateBlogCategoryDto` |
| PATCH | `/api/v1/admin/blog-categories/:id` | `UpdateBlogCategoryDto` |
| DELETE | `/api/v1/admin/blog-categories/:id` | Soft delete |

### Blog tags

| POST | `/api/v1/admin/blog-tags` | `CreateBlogTagDto` |
| PATCH | `/api/v1/admin/blog-tags/:id` | `UpdateBlogTagDto` |
| DELETE | `/api/v1/admin/blog-tags/:id` | Soft delete |

---

## 6. Other admin areas (legacy paths until migration)

These still live at their historical paths under **`/api/v1/...`** (see **`/api/docs/all`**). Target is **`/api/v1/admin/...`** per [API-ARCHITECTURE.md](../architecture/API-ARCHITECTURE.md).

| Domain | Examples (current) | Purpose |
|--------|--------------------|--------|
| Provinces | `PATCH /api/v1/provinces/:id` | CMS for destination pages |
| Hotels / rooms / tours | `POST/PATCH/DELETE ...` | Catalog (fix unguarded mutations when migrating) |
| Bookings | `GET /api/v1/bookings`, `PATCH .../verify-receipt` | Operations |
| Tour bookings | `PATCH .../assign-guide`, admin lists | Assign guide, confirm |
| Reviews | `GET /api/v1/reviews/admin`, `PATCH .../status` | Moderation |
| Favorites | `GET /api/v1/favorites/admin` | Support / analytics |
| Tour guides | `POST /api/v1/tour-guides`, `PATCH .../verify` | CRM |
| Users / roles / permissions | `/api/v1/users`, `/api/v1/roles`, `/api/v1/api-permissions`, … | **Must be locked down** — many are currently unguarded at HTTP layer |
| Audit | `GET /api/v1/audit-logs` | Compliance |
| Analytics | `GET /api/v1/admin/dashboard/*` | Dashboards — add auth when migrating |
| Media | `POST /api/v1/media/upload` | Uploads before referencing URLs in DTOs |

---

## 7. Role & access notes

- **Today:** primary staff role string is **`admin`**. **`super_admin`** is reserved in code for future use.
- **Future:** routes may carry **`@ApiCode('...')`** metadata; a permission guard will check allowed API codes from Mongo (`api_role` / `api_permission`) in addition to role strings. Expect **403** with more specific policy later.
- **Frontend:** protect routes with `account.roles.includes('admin')` (and later optional permission codes from `/me`).

---

## 8. Recommended admin SPA integration

1. **Login** via `/api/v1/auth/login`; store access token in memory for the session.
2. **Axios/fetch interceptor:** attach **`Authorization`**; on **401**, try refresh then logout to `/login`.
3. **CRUD screens:** call admin-prefixed APIs; show server **`message`** on errors.
4. **File uploads:** upload first (`/api/v1/media/upload` or Cloudinary policy from backend), then PATCH entity with `url` / `public_id` fields.
5. **Long lists:** server-driven pagination; avoid loading unbounded collections.

---

## 9. Webhooks & non-admin tech paths

- **Stripe:** `POST /payments/webhook/stripe` — **no** JWT; signature verification only. Do not call from the admin SPA for normal CRUD.
