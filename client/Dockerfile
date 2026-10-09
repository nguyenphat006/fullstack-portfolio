# Frontend production image — Next.js standalone output.
# Build:  docker build -t erp-web --build-arg NEXT_PUBLIC_API_URL=/api/v1 client
# NEXT_PUBLIC_* được "đóng" vào bundle lúc build -> đổi URL API phải build lại.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (không dùng npm ci): lockfile tạo trên Windows/npm 11 hay thiếu optional deps của Linux
# (@emnapi/*, @img/*) -> npm ci báo "not in sync". npm install vẫn giữ phiên bản đã khóa và bổ sung phần thiếu.
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
