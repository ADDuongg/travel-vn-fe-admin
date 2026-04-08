ok tôi## FE Admin Dashboard API Guide

### 1. Query chung cho tất cả endpoint

- **Query params**:
  - `range`: `today | 7d | 30d | custom` (default: `7d`)
  - `from`, `to`: ISO date string (chỉ dùng khi `range=custom`)
    - Ví dụ: `from=2025-03-01T00:00:00.000Z&to=2025-03-07T23:59:59.999Z`
  - Các endpoint dưới đây đều dùng chung format này.

> Hiện tại BE mới implement filter **theo thời gian**. Filter `city`, `tour` có thể bổ sung sau.

---

### 2. Các endpoint nhỏ cho từng box

Tất cả endpoint đều:

- **Method**: `GET`
- **Auth**: nên gọi kèm `Authorization: Bearer <access_token>`.

#### 2.1. Bookings summary (KPI + cho chart status)

- **URL**: `/api/v1/admin/dashboard/bookings`
- **Query**: `range`, `from`, `to`

Response:

```json
{
  "today": 12,
  "thisWeek": 87,
  "byStatus": {
    "PENDING": 10,
    "CONFIRMED": 60,
    "CANCELLED": 5,
    "EXPIRED": 12
  }
}
```

- **`today`**: số booking (không tính `CANCELLED`) được tạo từ đầu **hôm nay** đến hiện tại.
- **`thisWeek`**: số booking (không tính `CANCELLED`) được tạo trong **khoảng `range` hiện tại**.
- **`byStatus`**:
  - key: enum `BookingStatus` (`PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, ...).
  - value: tổng số booking với status đó (trên toàn bộ dữ liệu).

Có thể dùng để:

- Render KPI card "Total bookings".
- Vẽ pie chart / donut "Booking Status Distribution".

#### 2.2. Revenue summary

- **URL**: `/api/v1/admin/dashboard/revenue`
- **Query**: `range`, `from`, `to`

Response:

```json
{
  "today": 15000000,
  "thisWeek": 125000000,
  "currency": "VND"
}
```

- **`today`**: tổng `amount` của payment `SUCCEEDED` trong **ngày hiện tại**.
- **`thisWeek`**: tổng `amount` payment `SUCCEEDED` trong **khoảng `range` hiện tại**.
- **`currency`**: currency lấy từ payment (nếu không có payment nào thì mặc định `VND`).

Có thể dùng để:

- Render KPI card "Revenue".
- Vẽ line chart "Revenue Trend" (FE có thể call thêm endpoint trend riêng sau nếu cần chi tiết theo ngày).

#### 2.3. Users summary

- **URL**: `/api/v1/admin/dashboard/users`
- **Query**: `range`, `from`, `to`

Response:

```json
{
  "total": 2300,
  "newThisWeek": 45
}
```

- **`total`**: tổng số user trong hệ thống.
- **`newThisWeek`**: số user tạo trong **khoảng `range` hiện tại**.

Có thể dùng để:

- Render KPI card "Users".
- Tính % growth users theo từng khoảng thời gian (FE có thể gọi 2 lần với range khác nhau nếu cần).

#### 2.4. Catalog summary

- **URL**: `/api/v1/admin/dashboard/catalog`
- **Query**: không dùng thời gian (thống kê trạng thái hiện tại).

Response:

```json
{
  "activeHotels": 24,
  "activeRooms": 180,
  "activeTours": 36,
  "totalUsers": 2300
}
```

- **`activeHotels`**: số hotel có `isActive = true`.
- **`activeRooms`**: số room có `isActive = true`.
- **`activeTours`**: số tour có `isActive = true`.
- **`totalUsers`**: tổng số user trong hệ thống.

Có thể dùng để:

- Render KPI card "Active tours".
- Thêm card mini cho "Active hotels" / "Active rooms" nếu cần.

---

### 3. Endpoint tổng quan (overview) – optional

Nếu FE muốn lấy tất cả dữ liệu trong 1 call, có thể dùng:

- **URL**: `/api/v1/admin/dashboard/overview`
- **Query**: `range`, `from`, `to`

Response:

```json
{
  "bookings": {
    "today": 12,
    "thisWeek": 87,
    "byStatus": {
      "PENDING": 10,
      "CONFIRMED": 60,
      "CANCELLED": 5,
      "EXPIRED": 12
    }
  },
  "revenue": {
    "today": 15000000,
    "thisWeek": 125000000,
    "currency": "VND"
  },
  "users": {
    "total": 2300,
    "newThisWeek": 45
  },
  "catalog": {
    "activeHotels": 24,
    "activeRooms": 180,
    "activeTours": 36
  }
}
```

Lưu ý:

- Endpoint này bên trong sẽ gọi các hàm con; nếu một phần fail thì cả call có thể fail.
- Nếu FE ưu tiên resilience (một widget lỗi nhưng dashboard vẫn hiển thị phần còn lại) thì nên dùng các endpoint nhỏ ở mục 2.

---

### 4. Mapping với layout dashboard đề xuất

Theo `dashboard.mdc`:

- **KPI Cards**:
  - Total bookings → `/bookings`
  - Revenue → `/revenue`
  - Users → `/catalog.totalUsers` hoặc `/users.total`
  - Active tours / rooms / hotels → `/catalog`

- **Booking Status Distribution (pie chart)**:
  - Dùng `bookings.byStatus` từ `/bookings`.

- **Revenue Trend (line chart)**:
  - Dùng `/revenue` với các `range` khác nhau, hoặc mở rộng thêm endpoint trend theo ngày nếu cần.

- **Top Tours (bar chart)**:
  - Chưa implement BE chi tiết; có thể thêm endpoint riêng sau:
    - `GET /api/v1/admin/dashboard/charts/top-tours`.

- **Recent Bookings Table**:
  - Chưa implement BE trong file này; có thể thêm endpoint:
    - `GET /api/v1/admin/dashboard/recent-bookings`.

---

### 5. Gợi ý code FE (pseudo với React Query)

```ts
// ví dụ React Query / TanStack Query
const { data: bookings } = useQuery({
  queryKey: ['admin-dashboard-bookings', range],
  queryFn: () =>
    fetch(`/api/v1/admin/dashboard/bookings?range=${range}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => res.json()),
});

const { data: revenue } = useQuery({
  queryKey: ['admin-dashboard-revenue', range],
  queryFn: () =>
    fetch(`/api/v1/admin/dashboard/revenue?range=${range}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => res.json()),
});

// ... tương tự cho /users và /catalog
```

Sau đó map `bookings`, `revenue`, `users`, `catalog` vào các widget tương ứng trong dashboard.
