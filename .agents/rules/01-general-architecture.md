---
description: "Quy chuẩn kiến trúc tổng thể của Admin Template (Django + Next.js)"
globs: ["**/*"]
always_apply: true
---

# 🏢 TỔNG QUAN DỰ ÁN & QUY CHUẨN CHUNG (Admin Template)

## 1. Định hướng
- **Tên dự án:** Admin Template (Django + Next.js) — tác giả **ERICSS**.
- **Mục tiêu:** Nền quản trị full-stack dùng lại cho mọi dự án quản lý: lõi hệ thống (đăng nhập, RBAC, người dùng, nhật ký, đính kèm, xuất/nhập Excel, tìm kiếm, i18n) + phân hệ mẫu xóa được (`master_data`, `customers`, `suppliers`).
- **Khi clone sang dự án mới:** thay mục này bằng phạm vi nghiệp vụ của dự án (làm gì / không làm gì) để agent không tự mở rộng phạm vi.

## 2. Cấu trúc Monorepo
- `client/`: Next.js 16 (App Router + Turbopack + TypeScript) + Tailwind CSS v4 + shadcn/ui (Radix, lucide-react, sonner, react-hook-form).
- `server/`: Django 5.2 LTS + Django REST Framework + PostgreSQL (Neon DB / Docker).
- `docs/`: Hướng dẫn template (`TEMPLATE.md`), tìm kiếm toàn cục (`GLOBAL_SEARCH.md`), đặc tả RBAC.
- `docker-compose.yml`: Quản lý container Backend + PostgreSQL cục bộ.

## 3. Quy tắc Git & Chất lượng mã nguồn
- Sử dụng **Conventional Commits**: `feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`.
- Mọi thay đổi code Frontend phải qua `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build` (0 lỗi, 0 cảnh báo).
- Mọi thay đổi Backend phải đảm bảo `python manage.py check` và `python manage.py makemigrations` không có lỗi.

## 4. Nguyên Tắc Sống Còn: `server/database.dbml` là Single Source of Truth
- **BẮT BUỘC:** Mọi Model Database Backend (Django ORM) và cấu trúc màn hình Frontend **phải luôn bám sát 100% vào file thiết kế [server/database.dbml](server/database.dbml)**.
- **TUYỆT ĐỐI KHÔNG ĐƯỢC:** Tự ý viết code model, thêm cột, hoặc tạo bảng ở Backend/Frontend trước khi cấu trúc đó được phân tích, thiết kế và chốt chuẩn xác trong file `.dbml`.

## 5. Quy Tắc Luồng Làm Việc & Phê Duyệt Triển Khai (User Approval Gate)
- **Tách biệt rõ ràng giữa Lập Kế Hoạch (Planning/Design) và Thực Thi (Execution):** Khi USER yêu cầu brainstorm, phân tích kiến trúc, lập plan hoặc xuất tài liệu đặc tả (file `.md`, `.html`), Agent **CHỈ ĐƯỢC PHÉP** dừng lại ở việc tạo tài liệu và trình bày phương án.
- **BẮT BUỘC CHỜ QUYẾT ĐỊNH CỦA USER:** Tuyệt đối **KHÔNG ĐƯỢC TỰ Ý THỰC THI CODE** khi USER chưa trực tiếp xem xét và gõ lệnh phê duyệt rõ ràng trong hội thoại (ngay cả khi có tín hiệu tự động từ hệ thống). Quyền quyết định thời điểm và phạm vi bắt đầu code luôn thuộc về USER 100%.

