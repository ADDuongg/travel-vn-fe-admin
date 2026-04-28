# FE Client API — Public site & logged-in user

API for the **marketing / booking** website and **authenticated customers**. Use this for Next.js/Nuxt public routes, React Query in the account area, and mobile clients.

Companion: [FE-ADMIN-API.md](./FE-ADMIN-API.md) — staff dashboard.

Architecture: [API-ARCHITECTURE.md](../architecture/API-ARCHITECTURE.md).

---

## 1. Base URLs

| Environment | Base |
|-------------|------|
| Local | `http://localhost:9001/api/v1` (default port from `PORT`; check your `.env`) |
| Staging / production | Provided by DevOps (same path prefix **`/api/v1`**) |

Paths below are **relative to `/api/v1`** unless noted (e.g. **`/health`** is **not** under `/api/v1`).

**OpenAPI (dev only):**

- Full: `GET /api/docs/all`
- Public slice: `GET /api/docs/public`
- Client slice (target as modules migrate): `GET /api/docs/client`

---

## 2. Authentication

### 2.1 Registration & login

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "jane",
  "password": "SecurePass123",
  "email": "jane@example.com"
}
```

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "jane",
  "password": "SecurePass123"
}
```

**Login response (wrapper sees `data` nested — see §3):**

```json
{
  "statusCode": 200,
  "status": true,
  "timestamp": "2026-04-28T08:00:00.000Z",
  "data": {
    "access_token": "<JWT access token>",
    "account": {
      "id": "...",
      "username": "jane",
      "roles": ["user"],
      "routers": [],
      "apis": []
    }
  },
  "message": "success"
}
```

- **`Authorization: Bearer <access_token>`** on protected routes.
- **Refresh token** is issued as an **httpOnly** cookie with path **`/api/v1/auth`** (not readable from JS).

### 2.2 Refresh

```http
POST /api/v1/auth/refresh
Cookie: refresh_token=<opaque>
```

Rotate access token; may rotate refresh cookie server-side.

### 2.3 Current user (target after full auth split)

Today: **`GET /api/v1/auth/me`** with Bearer token.

Target doc: **`GET /api/v1/client/auth/me`** — same behavior; migrate when backend moves the route.

### 2.4 Logout

```http
POST /api/v1/auth/logout
Cookie: refresh_token=...
```

Clears refresh cookie (`path: /api/v1/auth`).

```http
POST /api/v1/auth/logout-all
Authorization: Bearer <access_token>
```

Revokes all refresh sessions for the user.

---

## 3. Standard success envelope

Every successful JSON response is wrapped:

```json
{
  "statusCode": 200,
  "status": true,
  "timestamp": "2026-04-28T08:00:00.000Z",
  "data": {},
  "message": "success"
}
```

Read **`response.data`** on the client after JSON parse.

---

## 4. Standard error envelope

```json
{
  "statusCode": 400,
  "status": false,
  "timestamp": "2026-04-28T08:00:00.000Z",
  "path": "/api/v1/...",
  "message": "Validation failed: ...",
  "data": null
}
```

Typical status codes: **400** validation, **401** missing/invalid JWT, **403** authenticated but not allowed, **404** missing resource, **409** conflict, **429** throttling (auth routes).

---

## 5. Pagination & filtering (convention)

Query:

```
?page=1&limit=20&search=...
```

Recommended list **`data`** shape (normalized target; legacy modules may differ until migrated):

```json
{
  "items": [{}],
  "page": 1,
  "limit": 20,
  "total": 42,
  "totalPages": 3
}
```

---

## 6. Public content (SEO, no login)

Pilot **blogs** — ship reads from **`/api/v1/public/...`**:

| Method | Path | Description |
|--------|------|---------------|
| GET | `/public/blogs` | Published posts (`page`, `limit`, filters per DTO) |
| GET | `/public/blogs/featured?limit=6` | Featured posts |
| GET | `/public/blogs/:slug/related` | Related posts |
| GET | `/public/blogs/:slug` | Detail (increment `viewCount`). Optional Bearer for future personalized fields |

**Blog categories (@Public)**

| GET | `/public/blog-categories` | List |
| GET | `/public/blog-categories/:slug` | By slug |

**Blog tags (@Public)**

| GET | `/public/blog-tags` | List |

Example:

```http
GET /api/v1/public/blogs?page=1&limit=12&sort=latest
Accept: application/json
```

Example response excerpt:

```json
{
  "statusCode": 200,
  "status": true,
  "data": {
    "docs": [{}],
    "totalDocs": 100,
    "page": 1,
    "limit": 12
  },
  "message": "success"
}
```

*(Exact pagination field names follow each module’s service until normalized.)*

### Other public domains (legacy paths until migrated)

Use **`/api/v1/tours`**, **`/api/v1/hotels`**, **`/api/v1/provinces`**, **`/api/v1/reviews`**, etc. — see Swagger **`/api/docs/all`**. They will move under **`/public/...`** per [API-ARCHITECTURE.md](../architecture/API-ARCHITECTURE.md).

---

## 7. Authenticated client (normal user)

Use **`Authorization: Bearer`**. Examples (legacy paths until migration):

| Area | Example routes | Notes |
|------|----------------|--------|
| Profile | `PATCH /api/v1/users/profile/me` (multipart) | Me-only |
| Favorites | `POST /api/v1/favorites/toggle`, `GET /api/v1/favorites/me/list` | |
| Room bookings | `POST /api/v1/bookings/room`, `GET /api/v1/bookings/me` | |
| Tour bookings | `POST /api/v1/tour-bookings`, `GET /api/v1/tour-bookings/my-bookings` | |
| Reviews | `POST /api/v1/reviews`, `GET /api/v1/reviews/me/list` | |
| Notifications | `GET /api/v1/notifications` | Poll or refresh after actions |
| Payments | `POST /payments/create-intent` | **Note:** `payments` is **outside** `/api/v1` prefix — full URL `https://host/payments/create-intent` |

---

## 8. Role / access

- **Public**: no `Authorization` header.
- **Client**: JWT with `roles` containing at least **`user`** (or implied).
- **Admin-only** endpoints return **403** if the user is not `admin` — do not use these in the public site (see admin doc).

---

## 9. Recommended frontend integration flow

1. **Public pages (SSR/SSG):** call **`/api/v1/public/*`** and legacy **`/api/v1/tours`**, etc., without tokens; cache HTML at CDN where possible.
2. **Detail pages with optional personalization:** send Bearer when the user is logged in (same URL); backend may add fields later.
3. **Account shell:** after login, store **access token** in memory (or secure storage per your threat model); attach **`Authorization`** to **`/api/v1/*` client routes**.
4. **Refresh:** on **401**, call **`POST /api/v1/auth/refresh`** with **`credentials: 'include'`**, retry once, else redirect to login.
5. **Optimistic UI:** favorites/reviews — rollback if error envelope returns **4xx/5xx**.

---

## 10. Health check (ops)

```http
GET /health
```

No `/api/v1` prefix.
