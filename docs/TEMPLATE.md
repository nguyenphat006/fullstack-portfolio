# Hướng dẫn dùng Template

> **Lưu ý (dự án Portfolio):** repo này đã dựng từ template. Các module mẫu `master_data`, `customers`, `suppliers` đã được gỡ; nhóm menu mới là `CONTENT` (`projects`, `blogs`, `contacts`), trang chủ admin là `/dashboard`, landing nằm ở `client/src/app/(landing)`. Các mục dưới đây là tài liệu gốc của template, dùng khi thêm module mới.

Repo này là **template quản trị (admin) full-stack**: Django 5.2 LTS + DRF + PostgreSQL ở backend, Next.js 16 + Tailwind CSS v4 + shadcn/ui ở frontend. Clone về, đổi thương hiệu, rồi chỉ việc viết tính năng riêng của đề tài.

## 1. Có sẵn những gì

| Nhóm | Tính năng |
|---|---|
| Tài khoản | Đăng nhập JWT (tự refresh token), hồ sơ cá nhân, đổi mật khẩu, đăng xuất (blacklist token) |
| Phân quyền | RBAC động: phân hệ (ModuleRegistry) → quyền → vai trò; ma trận phân quyền trên UI; menu sidebar tự lọc theo quyền |
| Người dùng | CRUD, khóa/mở hàng loạt, nhập/xuất Excel, trang hồ sơ chi tiết |
| Hệ thống | Nhật ký thao tác (pghistory), tệp đính kèm đa hình + xem trước PDF/Word/Excel/ảnh, xuất Excel chạy nền (Celery) |
| Giao diện | Sáng / tối / theo hệ thống, sidebar thu gọn + ngăn kéo trên mobile, trang 404 / lỗi / loading, định dạng số VN / quốc tế |
| Nền tảng API | Response thống nhất `{success, message, data, errors, code}`, `BaseERPViewSet` (CRUD + batch + export), `createCrudService` / `createCrudHooks`, types sinh từ OpenAPI |
| Chất lượng | Unit test backend, CI GitHub Actions, Dependabot, rules + skills cho AI agent (`.claude/`, `.agents/`) |
| Module mẫu | `master_data` (Đơn vị tính, Nhóm NVL, Nguyên vật liệu), `customers` (Khách hàng), `suppliers` (Nhà cung cấp) — tham khảo cách viết một module hoàn chỉnh, xóa được |

## 2. Tạo dự án mới từ template

```bash
git clone <repo-template> ten-du-an && cd ten-du-an
rm -rf .git && git init          # lịch sử mới cho dự án
```

### 2.1 Đổi thương hiệu (3 chỗ)
1. Tên, nhãn, dòng mô tả, đơn vị sở hữu, logo, định dạng số / ngày mặc định: sửa trên giao diện **Cài đặt → Cấu hình hệ thống** (bảng `SystemSettings`). `client/src/config/app.ts` (`APP_CONFIG`) chỉ là giá trị dự phòng + metadata tĩnh; đổi `STORAGE_KEYS` (tiền tố) khi clone. Dùng chung Redis với dự án khác → đặt `CACHE_KEY_PREFIX` riêng (mặc định theo tên CSDL).
2. `client/src/app/globals.css` — biến màu `--c-*` cho giao diện sáng và tối (token shadcn `--primary`, `--border`... trỏ về các biến này; bo góc: `--radius`).
3. `server/config/settings.py` — `SPECTACULAR_SETTINGS` (tên API trên Swagger).

### 2.2 Chạy lần đầu
```bash
cp server/.env.example server/.env            # mặc định đã trỏ Postgres của docker-compose
cp client/.env.example client/.env.local
docker compose up -d db redis                  # Postgres + Redis
cd server && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt
python manage.py bootstrap --demo              # migrate + dữ liệu lõi + dữ liệu mẫu, tạo tài khoản admin
python manage.py runserver
cd ../client && npm install && npm run dev     # http://localhost:3000
```
- Tài khoản admin: `ADMIN_USERNAME` / `ADMIN_PASSWORD` trong `server/.env` (dev bỏ trống mật khẩu → `Admin@123456`).
- **Windows đã cài sẵn PostgreSQL** (service chiếm cổng 5432): kết nối rơi vào server đó và báo "password authentication failed". Dừng service, hoặc đổi cổng map của `db` trong `docker-compose.yml` (vd `55432:5432`) rồi sửa `DATABASE_URL`.
- Đổi cổng backend / frontend: sửa `NEXT_PUBLIC_API_URL` (`client/.env.local`) và `CORS_ALLOWED_ORIGINS` (`server/.env`) cho khớp.

### 2.3 Bỏ module mẫu (khi không cần)
`customers` và `suppliers` là app độc lập: xóa thư mục app, dòng trong `settings.py` / `urls.py`, thư mục frontend tương ứng, khối `CUSTOMER` / `SUPPLIER` trong `permissions.ts`, file `messages/<vi|en>/<ns>.json` + dòng đăng ký trong `messages/<locale>/index.ts`, và bảng trong DBML. Hai app này dùng nhóm menu `MASTER_DATA` khai báo trong `master_data/rbac.py` — bỏ `master_data` thì đổi `parent_code` của chúng.

Với `master_data`:
Phân hệ, quyền và quyền mặc định theo vai trò của module mẫu nằm trong `server/apps/master_data/rbac.py` (seed_core tự gom), nên chỉ cần:
1. Xóa `server/apps/master_data/`, bỏ dòng `'apps.master_data'` trong `config/settings.py` và dòng `apps.master_data.urls` trong `config/urls.py`.
2. Xóa `client/src/modules/master-data/`, `client/src/app/(dashboard)/master-data/` và 3 khối `UNIT`, `MATERIAL_CATEGORY`, `MATERIAL` trong `client/src/constants/permissions.ts`.
3. Xóa các bảng `UnitsOfMeasure`, `MaterialCategories`, `Materials`, `MetalMaterialSpecs` trong `server/database.dbml` (đổi tên file DBML theo dự án).
4. Dự án mới: tạo CSDL trống rồi `bootstrap` (không còn dữ liệu mẫu → `--demo` tự bỏ qua). Xóa `client/.next` trước khi chạy `tsc` (còn kiểu của route cũ).

Trang Tổng quan tự ẩn khối số liệu NVL khi không còn app `master_data`.

## 3. Thêm tính năng

### 3.1 Sinh phân hệ CRUD tự động (khuyên dùng)
```bash
# 1. Backend: tạo app mới (kèm rbac.py: phân hệ + 7 quyền + quyền mặc định theo vai trò) + tự đăng ký settings/urls,
#    in ra đoạn DBML cần thêm
cd server
python manage.py startmodule warehouses Warehouse --label "kho" --label-en "Warehouses" --route master-data/warehouses --parent MASTER_DATA
#    -> dán bảng DBML in ra vào database.dbml, bổ sung trường nghiệp vụ vào models.py / serializers.py
python manage.py makemigrations warehouses && python manage.py migrate && python manage.py seed_core
python manage.py test apps.warehouses && python manage.py spectacular --file schema.yml

# 2. Frontend: types từ OpenAPI rồi sinh module (bảng, bộ lọc, form, view, route, quyền)
cd ../client
npm run gen:api
npm run gen:module -- --entity Warehouse --label "kho" --label-en "Warehouses" --route master-data/warehouses --code WAREHOUSE
```
- `--route` viết **không có "/" đầu** (Git Bash trên Windows tự đổi `/abc` thành đường dẫn ổ đĩa).
- `--code` (mã phân hệ RBAC) mặc định suy từ tên entity (`PurchaseOrder` → `PURCHASE_ORDER`) và phải giống nhau ở 2 lệnh; `startmodule` in sẵn lệnh `gen:module` đúng mã.
- `--label-en` (tùy chọn, cả 2 lệnh): `startmodule` dùng làm tên menu khi chọn English (`module_name_en` trong `rbac.py`); `gen:module` điền vào tệp chữ `client/messages/en/<ns>.json`. Bỏ trống thì tệp `en` tạm chép chữ tiếng Việt — dịch lại sau (rule `frontend-i18n.md`).
- `gen:module` tạo namespace chữ `<ns>` = camelCase số nhiều của entity (`Warehouse` → `warehouses`): `client/messages/{vi,en}/warehouses.json` và tự đăng ký vào `messages/<locale>/index.ts`.
- Quyền mặc định theo vai trò của phân hệ mới: sửa `ROLE_PERMISSIONS` trong `apps/<app>/rbac.py` (ADMIN luôn có toàn bộ quyền). `seed_core` gán quyền mặc định cho cả vai trò đã có đối với quyền **mới tạo lần đầu**; quyền đã chỉnh trên ma trận phân quyền không bị ghi đè (đưa hết về mặc định: `seed_core --reset-role-permissions`).
- `--parent` trỏ tới nhóm menu có sẵn (vd `MASTER_DATA` của module mẫu); bỏ module mẫu thì dùng nhóm khác hoặc bỏ `--parent`.
- Mỗi phân hệ sinh ra là một app Django riêng; khuôn nằm ở `server/apps/core/module_template/` và `client/scripts/module-template/` — sửa khuôn để đổi chuẩn cho mọi module sau này.

### 3.2 Quy trình thủ công
- **Quy trình chuẩn:** DBML → model → serializer → `BaseERPViewSet` → quyền trong `seed_core` → test → `npm run gen:api` → service/hook bằng factory → View. Chi tiết: `.claude/skills/new-module/SKILL.md`.
- **Mẫu để sao chép:** backend `server/apps/master_data/` (UnitOfMeasure), frontend `client/src/modules/master-data/units/`. Module sinh hoàn toàn bằng generator: `suppliers`.
- **Quy chuẩn:** `CLAUDE.md` + `.claude/rules/` (hoặc `AGENTS.md` + `.agents/rules/` cho agent khác).


### Trang Tổng quan (dashboard mẫu)
- Mọi số liệu lấy từ 1 API `GET /api/v1/dashboard/overview/` (`server/apps/dashboard/views.py`, cache 60 giây theo user); khối nào user không có quyền READ trả `null` và tự ẩn.
- Thêm KPI cho module mới: viết hàm `_kpi_<ten>(user, perms, now)` trả `{key, label, value, delta, previous, hint, href}` rồi thêm vào `KPI_BUILDERS`. Biểu đồ dùng `recharts`, màu lấy qua `useCssVars` để đúng cả sáng / tối.

## 3b. Đa ngôn ngữ (vi / en)
- Người dùng đổi ngôn ngữ ở menu tài khoản (hoặc góc trang đăng nhập); lưu cookie `NEXT_LOCALE`, frontend gửi `Accept-Language` cho backend.
- **Frontend:** chữ ở `client/messages/<vi|en>/<namespace>.json`, dùng `useTranslations()`; `npm run i18n:check` so khớp khóa (rule `.claude/rules/frontend-i18n.md`).
- **Backend:** chuỗi trả cho client bọc `gettext_lazy` / `gettext` (tiếng Việt làm khóa), bản dịch ở `server/locale/en/LC_MESSAGES/django.po`. Sau khi thêm / sửa chuỗi (cần gettext — có sẵn trong container `api`):
  ```bash
  python manage.py makemessages -l en --no-location --ignore='venv/*' --ignore='*/migrations/*' --ignore='*/module_template/*'
  # dịch các msgstr trống trong django.po, rồi:
  python manage.py compilemessages --ignore='venv/*'
  ```
  CI đỏ nếu còn chuỗi chưa dịch; test `apps/core/tests_i18n.py` đỏ nếu quên `compilemessages`.
- Tên menu / phân hệ: cột `module_name_en`, `description_en` (sửa ở Cài đặt → Phân hệ). Dữ liệu người dùng nhập (tên NVL…) và thông báo đã lưu (lưu theo ngôn ngữ của request tạo ra nó) không dịch.
- Thêm ngôn ngữ thứ ba: `LANGUAGES` (settings), `LOCALES` (`client/src/i18n/config.ts`), thư mục `client/messages/<mã>` + `server/locale/<mã>`.

## 4. Chạy production (Docker)
```bash
cp .env.prod.example .env.prod        # SECRET_KEY, POSTGRES_PASSWORD, ADMIN_PASSWORD, ALLOWED_HOSTS...
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```
- Stack: `nginx` (cổng 80, cổng vào duy nhất) → `web` (Next.js standalone) + `api` (gunicorn + whitenoise) + `worker` (Celery) + `db` + `redis`.
- `api` tự chạy `bootstrap` (migrate + seed_core, không ghi đè dữ liệu) mỗi lần khởi động; healthcheck qua `GET /api/v1/health/`.
- File upload nằm ở volume `media`, nginx phục vụ tại `/media/`. HTTPS: đặt sau proxy có TLS rồi bật `SECURE_SSL_REDIRECT=True`, `CSRF_TRUSTED_ORIGINS`.
- Smoke test sau khi deploy: `E2E_BASE_URL=https://erp.example.com E2E_PASSWORD=... npm run test:e2e` (trong `client/`).

## 5. Giao diện sáng / tối
- Component tự viết dùng lớp Tailwind theo token (`text-foreground`, `text-muted-foreground`, `bg-background`, `border`) hoặc biến CSS `var(--c-*)`. **Không** viết mã hex cứng — sẽ sai màu ở chế độ tối.
- Khối nền màu thương hiệu có chữ trắng (banner, avatar) dùng gradient **cố định** hoặc `var(--c-brand-gradient)`, không dùng biến màu chữ.
- Người dùng đổi giao diện tại menu avatar → "Giao diện". Lựa chọn lưu ở `localStorage` (`STORAGE_KEYS.themeMode`).

## 6. Lệnh thường dùng
| Việc | Lệnh |
|---|---|
| Khởi tạo máy mới | `python manage.py bootstrap --demo` |
| Cập nhật quyền sau khi thêm module | `python manage.py seed_core` (không ghi đè chỉnh sửa trên UI) |
| Đưa quyền vai trò về mặc định | `python manage.py seed_core --reset-role-permissions` |
| Test backend | `docker exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/portfolio_db portfolio_backend python manage.py test` |
| Sinh lại hợp đồng API | `python manage.py spectacular --file schema.yml` → `cd client && npm run gen:api` |
| Kiểm tra frontend | `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build` |
| Smoke test giao diện | `E2E_BASE_URL=... E2E_PASSWORD=... npm run test:e2e` (lần đầu: `npx playwright install chromium`) |
| Sinh phân hệ mới | `python manage.py startmodule ...` → `npm run gen:api` → `npm run gen:module -- ...` |

---
Template do **ERICSS** xây dựng — GitHub [@nguyenphat006](https://github.com/nguyenphat006).
