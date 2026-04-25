# Province API — FE update guide (dynamic language)

This document describes **breaking changes** after the Province “dynamic language” refactor. Sync Admin and Client apps with these contracts.

## Không có API tạo tỉnh (create)

- Backend **không** expose `POST /api/v1/provinces`. Danh sách tỉnh, `code` / `slug` / `name` cơ sở và `wards` đến từ **seed / import DB** (script hoặc pipeline nội bộ).
- Admin chỉ **chỉnh sửa nội dung** (mô tả, ảnh, highlight, thống kê, v.v.) qua `PATCH` bên dưới. Đừng bắt FE implement form “tạo tỉnh mới” qua public API nếu product không có use case này.

## Hai API tách bạch (Admin)

1. **Upload ảnh (Media)** — `POST /api/v1/media/upload` (field `file`) hoặc `POST /api/v1/media/upload-multiple` (field `files`). Response chuẩn hóa: `{ url, publicId, ... }` (xem mục Media response) — map vào `thumbnail` / `gallery` / `highlights[].thumbnail` trên `PATCH` province.
2. **Cập nhật tỉnh (JSON thuần)** — `PATCH /api/v1/provinces/:id` với `Content-Type: application/json` + `Authorization: Bearer <admin token>`. **Không** gửi file trong request province; gắn `url` / `publicId` từ bước 1 vào `thumbnail`, từng phần tử `gallery`, `highlights[].thumbnail`.

Luồng này tránh `multipart/form-data` trộn JSON + file, dễ maintain cho FE/BE.

### Response `POST /api/v1/media/upload` & `upload-multiple`

Body trả về **đã chuẩn hóa** (không phải raw Cloudinary đầy đủ):

| Field | Ý nghĩa |
|-------|---------|
| `url` | URL ảnh (tương đương `secure_url`) — gán vào `thumbnail.url` / `gallery[].url` / `highlights[].thumbnail.url` |
| `publicId` | `public_id` trên Cloudinary — gán vào `publicId` để BE xóa asset khi đổi/xóa |
| `format`, `width`, `height`, `bytes` | Metadata tùy chọn (FE có thể bỏ qua khi build payload province) |

`upload-multiple` trả về **mảng** cùng shape từng phần tử.

## Checklist chỉnh FE Admin

1. Bỏ mọi `FormData` / multipart cho `PATCH /provinces/:id`; dùng `JSON.stringify` body hoặc client gửi object (Axios `data: payload`).
2. Trước khi save province: upload từng ảnh (hoặc batch `upload-multiple`), map `url` + `publicId` vào state form.
3. `highlights[].translations` phải có đủ **mọi** mã ngôn ngữ đang active trên BE (xem collection `languages`).
4. Không implement màn “tạo tỉnh mới” qua API public trừ khi product đổi — hiện không có endpoint create.

## Summary of changes

| Area | Before | After |
|------|--------|--------|
| `PATCH /provinces/:id` | `multipart/form-data` (file + JSON string) | **`application/json` only** — media qua API riêng |
| `name`, `fullName`, `ward.name` | `{ vi: string; en: string }` only | `Record<string, string>` — language code (lowercase) → string |
| `highlights[]` | `name` + `description` as `{ vi, en }` | `translations: { [lang]: { name: string; description?: string } }` only |
| Sort / search | Hardcoded `vi` / `en` | Backend uses **active languages** from `GET /languages` (collection `languages`, `isActive: true`). Fallback if none: `vi`, `en`. |
| Cloudinary (media) | — | `POST /media/*` gọi upload **không** `folder` (ảnh phẳng, phù hợp demo). |

## TypeScript (copy to FE)

```ts
/** Province / ward display names */
export type DynamicLocalized = Record<string, string>;

export interface ImageItem {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

export interface ProvinceHighlightItem {
  translations: Record<string, { name: string; description?: string }>;
  thumbnail?: ImageItem;
}

export interface ProvinceListItem {
  _id: string;
  type: string;
  code: string;
  slug: string;
  name: DynamicLocalized;
  fullName?: DynamicLocalized;
  thumbnail?: ImageItem;
  gallery: ImageItem[];
  translations: Record<string, ProvinceTranslation>;
  // ... see src/provinces/provinces.types.ts
}
```

Full source of truth: [`src/provinces/provinces.types.ts`](../src/provinces/provinces.types.ts).

## Displaying localized strings (Client)

Use the app locale key in **lowercase** to read from `DynamicLocalized`:

```ts
const title = province.name[locale] ?? province.name['vi'] ?? Object.values(province.name)[0];
```

Same for `highlights[].translations[locale].name` / `.description`.

## Admin `PATCH /api/v1/provinces/:id` (JSON)

- Header: `Content-Type: application/json`, `Authorization: Bearer <token>`.
- Mọi field (kể cả `translations`, `highlights`, `gallery`, `thumbnail`) là object/array JSON bình thường, **không** stringify rồi đặt trong `multipart`.

### `highlights`

Mỗi phần tử cần `translations` với `name` **khác rỗng** cho **mọi ngôn ngữ đang active** trên BE (cùng rule validation). Key ngôn ngữ **lowercase** (`vi`, `en`, …).

Vẫn hỗ trợ tạm **legacy** (object `name` / `description` theo từng mã) khi service parse — ưu tiên ghi mới theo `translations` + media API.

Ví dụ (đã upload ảnh highlight qua media, map `secure_url` → `url`, `public_id` → `publicId`):

```json
{
  "highlights": [
    {
      "translations": {
        "vi": { "name": "Phố cổ", "description": "Mô tả..." },
        "en": { "name": "Old Quarter", "description": "..." }
      },
      "thumbnail": {
        "url": "https://res.cloudinary.com/.../x.jpg",
        "publicId": "folder/abc123",
        "alt": "",
        "order": 0
      }
    }
  ]
}
```

### `thumbnail` & `gallery`

Dùng object đã gắn URL/publicId từ media API (ví dụ `thumbnail: { "url": "...", "publicId": "..." }` — `publicId` khuyến nghị để BE xóa asset cũ khi thay thế / bỏ khỏi gallery).

## Public API response shape

`GET /api/v1/provinces`, `GET /api/v1/provinces/:slug`, `GET /api/v1/provinces/popular`, `GET /api/v1/provinces/dropdown`:

- List / detail / popular: `name` and `fullName` are **objects** with dynamic keys.  
- **Highlights** in JSON responses use **`translations`** (not separate `name` / `description` objects).  

## Migration notes (FE code)

1. Replace `province.name.vi` / `.en` with `province.name[lang]` or helpers that fall back across keys.  
2. Replace highlight UI that read `highlight.name.vi` with `highlight.translations[lang].name`.  
3. Ensure admin forms iterate **active languages** from your language API when building `translations` for each highlight.  
4. Update any hardcoded types that used `LocalizedName` with fixed `vi` / `en`.

## Related docs (may need small edits)

- [`PROVINCE-BE-FIELDS.md`](PROVINCE-BE-FIELDS.md) — examples still show `{ vi, en }`; align with `DynamicLocalized` + `translations` for highlights.  
- [`PROVINCE-ADMIN-FE-BE-PAYLOAD.md`](PROVINCE-ADMIN-FE-BE-PAYLOAD.md) — highlight section: require `translations` per active language.  
- [`PROVINCE-MEDIA-UPLOAD-HANDOFF-BE.md`](PROVINCE-MEDIA-UPLOAD-HANDOFF-BE.md) — highlight JSON example should use `translations`, not `name` / `description` at top level.

## DB migration (ops)

Run the script in [`docs/migrations/province-highlights-to-translations.mongosh.js`](migrations/province-highlights-to-translations.mongosh.js) once on existing data so old `highlights[].name` / `description` documents are normalized to `translations`.
