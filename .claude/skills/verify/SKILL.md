---
name: verify
description: Chạy health check bắt buộc của Admin Template — backend (makemigrations, migrate, check) và/hoặc frontend (tsc, ESLint, npm run build). Dùng sau khi sửa code server/ hoặc client/, trước khi báo hoàn thành hoặc commit.
argument-hint: "[server|client|all]"
allowed-tools: Bash(python manage.py *) Bash(./venv/Scripts/python.exe manage.py *) Bash(npx tsc *) Bash(npm run build) Bash(npm run lint *) Bash(npm test) Bash(git status *) Bash(git diff *)
---

# Health check Admin Template

Phạm vi: `$ARGUMENTS` (mặc định: tự xác định từ `git status` — có file đổi trong `server/` thì chạy backend, trong `client/` thì chạy frontend).

## Backend (`server/`)
Dùng Python trong venv: `server/venv/Scripts/python.exe` (Windows). Chạy tuần tự, dừng ở bước lỗi đầu tiên:
1. `python manage.py makemigrations` — nếu sinh migration mới, liệt kê file và kiểm tra nó chỉ chứa thay đổi mong muốn (khớp DBML).
2. `python manage.py migrate`
3. `python manage.py check` — yêu cầu `System check identified no issues (0 silenced).`
4. Test (xem `.claude/rules/testing.md`): `MSYS_NO_PATHCONV=1 docker exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/app_db app_backend python manage.py test --noinput` (một app: thêm `apps.<app>`).

## Frontend (`client/`)
1. `npx tsc --noEmit` — không lỗi kiểu.
2. `npm run lint -- --max-warnings=0` — ESLint 0 lỗi, 0 cảnh báo (CI dùng đúng lệnh này).
3. `npm test` — Vitest xanh (có file `*.test.ts(x)` liên quan thay đổi thì phải chạy).
4. `npm run build` — 0 errors, 0 warnings.

## Báo cáo
- Liệt kê từng lệnh: ✅ / ❌ kèm trích đoạn lỗi ngắn gọn.
- Có lỗi: sửa nếu lỗi nằm trong phạm vi thay đổi của phiên này rồi chạy lại; lỗi có sẵn từ trước thì báo user, không tự sửa lan man.
- Không tuyên bố "đã xong" khi chưa có kết quả thực.
