# Travl VN FE Admin

Admin frontend — React + TypeScript + Vite.

## Tài khoản đăng nhập admin

Áp dụng khi backend dev/staging đã tạo user tương ứng. Đăng nhập tại route `/login`.

| Trường     | Giá trị       |
|-----------|---------------|
| Username  | `duongnv`     |
| Password  | `123123123`   |

Không đưa tài khoản hoặc mật khẩu production vào tài liệu công khai.

Chi tiết stack và pattern xem [`TECH_STACK.md`](./TECH_STACK.md).

---

## Phát triển cục bộ

```bash
yarn install
yarn dev
```

Build production:

```bash
yarn build
```

Lint:

```bash
yarn lint
```

---

## ESLint

Cấu hình dùng ESLint flat config và TypeScript-aware rules — xem `eslint.config.js`. Để bật type-checked rules đầy đủ có thể mở rộng config theo hướng dẫn [typescript-eslint](https://typescript-eslint.io/getting-started) và thêm `parserOptions.project` trỏ tới `tsconfig.app.json` / `tsconfig.node.json`.
