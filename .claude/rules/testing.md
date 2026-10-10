---
paths:
  - "server/**"
  - "client/**"
---

# Kiểm thử — backend, frontend, end-to-end

Mục tiêu: test bảo vệ **hành vi** (hợp đồng API, quy tắc nghiệp vụ, phân quyền, logic tính toán), không bảo vệ chi tiết cài đặt. Test nhiều ở tầng dưới (nhanh, ổn định), ít ở tầng trên (chậm, dễ vỡ).

## Chọn công cụ theo tình huống
| Cần kiểm tra | Công cụ | Vị trí |
|---|---|---|
| API trả đúng envelope, mã lỗi, phân trang, lọc / sắp xếp | Django `TestCase` + `APIClient` | `server/apps/<app>/tests.py` |
| Phân quyền: thiếu quyền → 403, không leo thang quyền | Django `TestCase` | `tests.py`, `tests_security.py` |
| Quy tắc nghiệp vụ (`check_can_destroy`, `BusinessError`, sinh mã, chống trùng) | Django `TestCase` | `tests.py` |
| Service tính toán (định mức, diện tích sơn, BOM explosion) | Django `SimpleTestCase` / `TestCase` gọi thẳng hàm service | `tests.py` hoặc `tests_<service>.py` |
| Lệnh quản trị (seed, startmodule), migration dữ liệu | Django `TestCase` + `call_command` | `tests_seed.py` |
| Đa ngôn ngữ backend (Accept-Language, `.mo` khớp `.po`) | Django `TestCase` | `apps/core/tests_i18n.py` |
| Hàm thuần frontend (format số, bộ lọc → tham số API, utils, tính toán quy cách) | Vitest | `*.test.ts` cạnh file |
| Hook có logic (trạng thái danh sách trên URL, tùy chỉnh cột) | Vitest + `renderHook` | `*.test.ts` cạnh file |
| Component có hành vi (FormDialog gắn lỗi server, xác nhận khi đóng, ô nhập số) | Vitest + Testing Library + `userEvent` | `*.test.tsx` cạnh file |
| Luồng chính chạy thật trên cả hệ thống (đăng nhập, mở các màn hình lõi, Ctrl+K) | Playwright | `client/e2e/*.spec.ts` |
| Giao diện đúng (sáng / tối, mobile, bố cục) | Ảnh chụp Playwright + mắt người khi QA | không commit ảnh |

Không viết test cho: primitive shadcn (`components/ui`), markup tĩnh, snapshot cả trang, lặp lại điều đã được test ở tầng dưới (vd. không E2E từng lỗi validate khi backend test đã phủ).

## Backend (Django)
- Mỗi module mới tối thiểu (khuôn `startmodule` sinh sẵn): list / create / lỗi validate theo envelope, user thiếu quyền → 403, mọi hook nghiệp vụ, mọi service tính toán.
- Dùng helper có sẵn: `ApiTestMixin.assertEnvelope`, `make_user_with_perms` (mẫu `apps/master_data/tests.py`); tạo dữ liệu trong `setUp` / hàm factory nhỏ, **không** dựa vào `seed_demo` (trừ test của chính lệnh seed).
- Kiểm tra `code` lỗi (`validation_error`, `business_rule`…) và trường trong `errors`, không so khớp nguyên văn câu thông báo (câu đổi theo ngôn ngữ). Ngoại lệ: test đa ngôn ngữ.
- Code lõi không phụ thuộc cứng app mẫu `master_data` (test lõi dùng user / role / phân hệ lõi).
- Chạy trong container (Postgres thật, có pghistory trigger): `MSYS_NO_PATHCONV=1 docker exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/portfolio_db portfolio_backend python manage.py test --noinput` (một app: thêm `apps.<app>`).

## Frontend (Vitest + Testing Library)
- `npm test` (chạy 1 lần, CI) · `npm run test:watch`. Cấu hình `client/vitest.config.ts` (jsdom, alias `@`), setup `src/test/setup.ts` (jest-dom).
- Đặt test cạnh file: `filters.ts` → `filters.test.ts`. Import tường minh: `import { describe, it, expect, vi } from "vitest"`.
- Component dùng `useTranslations` / `useQuery` → render bằng `renderWithProviders` (`src/test/render.tsx`, chữ tiếng Việt + QueryClient không retry). Tìm phần tử theo vai trò / nhãn (`getByRole`, `getByLabelText`) như người dùng thấy, không theo class CSS.
- Tương tác bằng `userEvent` (gõ, bấm, Tab), không gọi thẳng `fireEvent` trừ khi cần sự kiện đặc biệt.
- Gọi API: mock **service** của module (`vi.mock("../services/unit.service")`), không mock axios nội bộ; lỗi backend giả lập bằng object envelope thật (`{ response: { data: { success: false, code, errors } } }`).
- Hook đọc URL (`useListState`): mock `next/navigation` (`useRouter`, `useSearchParams`, `usePathname`).
- Mỗi test độc lập (không phụ thuộc thứ tự), không `setTimeout` thật — dùng `vi.useFakeTimers()` cho debounce / polling.
- `src/test/setup.ts` đã dọn DOM + cookie sau mỗi test (`globals: false` nên Testing Library không tự `cleanup`) — không xóa. Test chạy riêng xanh nhưng chạy cả file đỏ → nghi trạng thái sót giữa các test.
- Component trong Radix Dialog / AlertDialog: `const user = userEvent.setup({ pointerEventsCheck: 0 })` (jsdom không tính lại `pointer-events: none` Radix gắn lên body). Mẫu: `components/form/FormDialog.test.tsx`.
- Có sẵn test mẫu để chép: hàm thuần `components/list/filters.test.ts`, hook đọc URL `useListState.test.ts`, lỗi axios giả `lib/api/errorUtils.test.ts`.

## End-to-end (Playwright)
- Chỉ luồng quan trọng, ít nhưng chạy thật: `client/e2e/smoke.spec.ts`. Chạy trên stack đang chạy: `E2E_BASE_URL=http://localhost:3000 E2E_PASSWORD=... npm run test:e2e`.
- Selector theo vai trò / chữ hiển thị / `aria-label`; chờ phần tử hiện (`expect(...).toBeVisible()`), không `waitForTimeout` cố định.
- Tài khoản test tạo riêng rồi xóa, không dùng / đổi mật khẩu admin thật.

## Khi nào phải viết test
- Sửa lỗi → viết test tái hiện lỗi trước (đỏ), sửa code cho xanh. Lỗi quan trọng ghi thêm vào bảng "Bẫy đã gặp".
- Thêm quy tắc nghiệp vụ / quyền / service tính toán → test cùng commit.
- Logic thuần mới ở frontend (tính toán, chuyển đổi dữ liệu, bộ lọc) → test cùng commit. Màn hình CRUD chỉ khai báo cấu hình (`ListPage`, `FormDialog`) không bắt buộc test riêng.
- Trước khi báo xong: test backend (nếu đổi server) + `npm test` (nếu đổi client) cùng health check ở skill `verify`.
