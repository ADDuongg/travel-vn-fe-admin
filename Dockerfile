# =============================================================================
# DOCKERFILE -- Multi-stage build cho React Vite SPA (Admin)
# =============================================================================
#
# Dockerfile nay dung chung cho ca staging va production.
# Su khac nhau giua 2 moi truong nam o cac ARG (VITE_*) truyen vao khi build.
#
# Gom 3 stage:
#   1. deps    -- Cai dat dependencies (layer cache, chi re-install khi lockfile doi)
#   2. builder -- Build SPA thanh static files (dist/)
#   3. runner  -- Nginx serve static files (image cuoi ~30MB, khong co Node)
#
# Cach build:
#   docker build \
#     --build-arg VITE_API_BASE_URL=https://admin.travel-vn.site/api \
#     --build-arg VITE_SOCKET_URL=https://admin.travel-vn.site \
#     --build-arg VITE_APP_API_URL=https://admin.travel-vn.site/api \
#     --build-arg VITE_DROP_CONSOLE=true \
#     -t admin-frontend:latest .
#
# =============================================================================


# -----------------------------------------------------------------------------
# Stage 1: DEPS -- Cai dat dependencies
# -----------------------------------------------------------------------------
# Tach rieng buoc install dependencies de tan dung Docker layer cache.
# Khi code thay doi nhung package.json/yarn.lock khong doi, Docker se dung cache
# cua layer nay thay vi install lai tu dau.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# --frozen-lockfile: dam bao install dung version trong lockfile, khong update
RUN yarn install --frozen-lockfile


# -----------------------------------------------------------------------------
# Stage 2: BUILDER -- Build SPA ra static files (dist/)
# -----------------------------------------------------------------------------
# Copy source code + node_modules, inject env vars, chay build.
# Cac bien VITE_* duoc truyen qua ARG -> ENV -> Vite doc tai build time.
# Ket qua: thu muc dist/ chua HTML/JS/CSS da optimize.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Build-time arguments -- truyen vao bang --build-arg khi chay docker build.
# Vite chi inject cac bien bat dau bang VITE_ vao bundle (PUBLIC, user nhin thay duoc).
# KHONG BAO GIO dat secret vao VITE_* variables.
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_API_URL
ARG VITE_DROP_CONSOLE

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_DROP_CONSOLE=${VITE_DROP_CONSOLE}

# Build SPA: tsc check types, sau do Vite bundle ra dist/
RUN yarn build


# -----------------------------------------------------------------------------
# Stage 3: RUNNER -- Nginx serve static files
# -----------------------------------------------------------------------------
# Image cuoi cung chi chua nginx + static files (dist/).
# Khong co Node.js, khong co source code, khong co node_modules.
# Image size ~30MB, attack surface nho.
#
# Day la container-level nginx (serve static + SPA fallback).
# Host VPS nginx xu ly SSL termination + reverse proxy vao container.
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

WORKDIR /usr/share/nginx/html

RUN rm -rf ./* && rm -f /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist ./

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
