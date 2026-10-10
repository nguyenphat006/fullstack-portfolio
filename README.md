# Fullstack Portfolio — ERICSS

Portfolio cá nhân của **Nguyễn Đăng Phát (ERICSS)** gồm landing page công khai và khu quản trị nội dung.

| Thành phần | Công nghệ | Đường dẫn |
|---|---|---|
| Landing page | Next.js 16, Tailwind v4, Motion | `/`, `/blog`, `/projects` |
| Khu quản trị | Next.js + shadcn/ui, TanStack Query, next-intl (vi/en) | `/login`, `/dashboard`, `/content/*` |
| Backend API | Django 5.2 + DRF, JWT, RBAC, nhật ký thao tác (pghistory), Celery/Redis | `/api/v1/` |
| CSDL | PostgreSQL 16 | `server/database.dbml` là thiết kế chuẩn |

Nền tảng backend và khu quản trị được dựng từ template **Django + Next.js** của ERICSS (xem `docs/TEMPLATE.md`).

## Cấu trúc

```
client/   Next.js: landing (src/app/(landing)) và admin (src/app/(admin))
server/   Django: apps/projects, apps/blogs, apps/contacts + lõi template (core, authentication, audit, dashboard)
docs/     Tài liệu template (TEMPLATE.md, GLOBAL_SEARCH.md, thiết kế RBAC)
```

Landing và admin dùng **hai root layout riêng** (CSS không đè nhau). Landing hiện vẫn đọc dữ liệu tĩnh từ
`client/src/config/`; backend đã có sẵn API công khai (`/api/v1/public/projects|blogs|contacts/`) để nối sau.

## Chạy local

```bash
# 1. Hạ tầng (Postgres cổng 55432 + Redis)
docker compose up -d db redis

# 2. Backend
cd server
cp .env.example .env                       # đặt SECRET_KEY, mặc định đã trỏ Postgres của docker-compose
python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt
python manage.py bootstrap --demo          # migrate + quyền/vai trò + admin + dữ liệu dự án/bài viết
python manage.py runserver                 # http://127.0.0.1:8000  (Swagger: /api/schema/swagger-ui/)

# 3. Frontend
cd ../client
cp .env.example .env.local                 # NEXT_PUBLIC_API_URL, GMAIL_USER, GMAIL_APP_PASSWORD
npm install && npm run dev                 # http://localhost:3000
```

Tài khoản admin: `admin` / `Admin@123456` (dev, đổi qua `ADMIN_PASSWORD` trong `server/.env`).

## Kiểm tra trước khi commit

```bash
cd server && python manage.py check && python manage.py test
cd client && npx tsc --noEmit && npm run lint -- --max-warnings=0 && npm run i18n:check && npm test && npm run build
```

## Triển khai

- **Landing (Vercel):** Root Directory = `client`. Biến môi trường: `GMAIL_USER`, `GMAIL_APP_PASSWORD`.
  Khi build trên Vercel, `output: "standalone"` tự tắt (chỉ dùng cho Docker).
- **Production Docker:** `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build` (xem `docs/TEMPLATE.md` mục 4).

## Tác giả

**ERICSS** — GitHub [@nguyenphat006](https://github.com/nguyenphat006)
