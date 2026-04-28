# Blog API — FE integration (blog module)

**Canonical English API guides:** [FE-CLIENT-API.md](./api/FE-CLIENT-API.md) · [FE-ADMIN-API.md](./api/FE-ADMIN-API.md).

All paths below are **relative to `/api/v1`**. Upload images first via **`POST /api/v1/media/upload`** (or upload-multiple), then put `url` / `public_id` into DTOs (thumbnail, gallery, category thumbnail…).

**Admin auth:** `Authorization: Bearer <accessToken>` with `roles` containing `admin`.

Resources were split into **public** vs **admin** route groups (no mixed controller). Post collection name in Mongo remains **`blog-posts`** (unchanged).

---

## FE Client (public website)

### Categories

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/public/blog-categories` | Danh sách (query: `page`, `limit`, `search`, public chỉ thấy `isActive: true` qua dữ liệu) |
| GET | `/public/blog-categories/:slug` | Chi tiết category theo `slug` |

### Tags

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/public/blog-tags` | Danh sách tag (query: `page`, `limit`, `search`) |

### Bài viết (posts)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/public/blogs` | Danh sách bài **đã publish** — query: `page`, `limit`, `search`, `category` (slug), `tag` (slug), `province` (slug tỉnh), `sort` = `latest` \| `popular` \| `oldest`, `lang` (ưu tiên giao diện) |
| GET | `/public/blogs/featured?limit=6` | Bài nổi bật |
| GET | `/public/blogs/:slug` | Chi tiết bài (tự **tăng** `viewCount` mỗi lần gọi). Optional Bearer cho tương lai cá nhân hóa |
| GET | `/public/blogs/:slug/related` | Bài gợi ý theo cùng category / tag / province (giới hạn 5) |

**Reserved slug (không dùng làm slug bài):** `admin`, `featured`.

Nội dung bài: `translations[lang].content` là mảng **Editor.js** blocks. `tableOfContents` & `readingTime` do BE tính lại khi tạo/cập nhật.

---

## FE Admin (JWT admin)

### Categories

| Method | Path | Body |
|--------|------|------|
| POST | `/admin/blog-categories` | `name` { vi, en,… }, `slug?`, `description?`, `thumbnail?`, `order?`, `isActive?`, `translations?` (SEO) |
| PATCH | `/admin/blog-categories/:id` | Partial |
| DELETE | `/admin/blog-categories/:id` | Soft delete (`isDeleted`, `isActive: false`) |

### Tags

| Method | Path | Body |
|--------|------|------|
| POST | `/admin/blog-tags` | `name` {…}, `slug?`, `isActive?` |
| PATCH | `/admin/blog-tags/:id` | Partial |
| DELETE | `/admin/blog-tags/:id` | Soft delete |

### Bài viết

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/admin/blogs` | Tất cả bài (kể cả draft) — query: `page`, `limit`, `search`, `status` = `draft` \| `published` |
| GET | `/admin/blogs/:id` | Chi tiết theo Mongo `_id` (form chỉnh sửa) |
| POST | `/admin/blogs` | Tạo bài. `author` = user đăng nhập. `status` mặc định `draft` |
| PATCH | `/admin/blogs/:id` | Cập nhật. Xóa category: gửi `category: null` hoặc `""` — BE chấp nhận clear trong service |
| PATCH | `/admin/blogs/:id/publish` | Publish (set `publishedAt` nếu chưa có) |
| PATCH | `/admin/blogs/:id/unpublish` | Về `draft` |
| DELETE | `/admin/blogs/:id` | Soft delete |

**Payload tạo/sửa bài (gợi ý):**

- `category`: Mongo `ObjectId` string (bắt buộc theo dữ liệu category đã tạo).
- `tags`: mảng ObjectId.
- `relatedProvinces` / `relatedTours` / `relatedHotels`: mảng ObjectId tương ứng entity có trong DB.
- `translations[lang]`: `title`, `excerpt`, `content` = mảng block Editor.js, `seo?`.

---

## Ghi chú

- `postCount` trên category/tag là **bài đã published**; điều chỉnh khi publish / unpublish / xóa / đổi category‑tags.
- Tìm text trên public list: regex trên `translations.*.title` theo mã ngôn ngữ đang cấu hình trong bảng `Language`.
