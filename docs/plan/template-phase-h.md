# Phase H — Hoàn thiện template (luồng clone, mẫu component, kiểm thử, đa ngôn ngữ)

Trạng thái: **đã duyệt** (2026-09-28) — kể cả DBML `ModuleNameEn` / `DescriptionEn` và lỗi API đa ngôn ngữ; thứ tự H1 → H2 → H3 → H4. Phạm vi đã chốt: mục 3 → 6 → 1 → 2 trong đề xuất (H1 → H4). Mục 4 (đăng nhập nâng cao) để sau.
Nguyên tắc chung: `frontend-ux.md`, DBML trước code, mỗi mục xong → health check + commit riêng.

---

## H1. Rà luồng "clone → đổi thương hiệu → thêm module" (mục 3)

Mục tiêu: người mới clone repo làm theo `docs/TEMPLATE.md` là chạy được, không phải hỏi.

1. Dựng lại từ đầu trên thư mục sạch (clone mới, CSDL Docker trống):
   `docker compose up` → `bootstrap --demo` → đăng nhập → đổi tên / logo / màu → `startmodule` → `gen:api` → `gen:module` → module mới hiện trên menu, CRUD + xuất Excel chạy được.
2. Ghi lại mọi chỗ vướng (lệnh sai, bước thiếu, lỗi script, tài liệu lệch code) và sửa ngay trong script / tài liệu.
3. Kiểm tra khuôn sinh sau khi đổi sang shadcn: file sinh ra qua `tsc` + ESLint + build không cảnh báo.
4. Thêm lệnh kiểm tra khuôn vào CI: sinh 1 module mẫu tạm (`startmodule` + `gen:module`) trên runner rồi build — khuôn hỏng thì CI đỏ.
5. Hướng dẫn "bỏ module mẫu master-data" (đã có trong TEMPLATE) → chạy thử thật, sửa nếu còn tham chiếu sót.

Kết quả: danh sách vấn đề đã sửa ghi vào nhật ký bên dưới; TEMPLATE.md cập nhật.

## H2. Mẫu component cho chứng từ phức tạp (mục 6) — HOÃN

> 2026-09-29: user hoãn. Component gắn nghiệp vụ (dòng chứng từ, cây BOM, wizard) để thảo luận kỹ khi làm frontend nghiệp vụ; khi đó ưu tiên pattern / rules chung (danh sách, bảng, nút).


Chuẩn bị cho BOM và Lệnh sản xuất. Component dùng chung, không gắn nghiệp vụ, đặt ở `components/form` / `components/controls`:

| Component | Dùng cho | Nội dung |
|---|---|---|
| `LineItemsField` | Dòng vật tư trong BOM, dòng lệnh SX | Bảng sửa tại chỗ trên `useFieldArray`: thêm / xóa / nhân bản dòng, kéo đổi thứ tự, cột khai báo như `defineColumns` (text, số có định dạng, chọn thực thể remote), dòng tổng cộng, lỗi validate theo từng ô (kể cả lỗi backend dạng `lines.2.qty`) |
| `StepForm` | Tạo lệnh SX nhiều bước | Wizard trên trang riêng: thanh bước, mỗi bước validate phần của mình trước khi sang bước sau, quay lại không mất dữ liệu, bước cuối "Xem lại" |
| `TreeEditor` | Cây linh kiện (FRAME → ASSEMBLY → PART) | Cây có mở / đóng, thêm con, sửa, xóa, kéo thả đổi cha / thứ tự (dnd-kit), chọn nút → panel chi tiết bên phải; ràng buộc cấp do nơi dùng truyền vào (`canDrop`) |
| `FormPage` | Trang `/[module]/new`, `/[module]/[id]/edit` | Khung trang form dài: header + nút Lưu dính dưới, cảnh báo rời trang khi còn thay đổi (thay cho FormDialog khi form lớn) |

Trang trình diễn: **`/examples`** (xem câu hỏi Q1) dùng dữ liệu giả trong bộ nhớ, không cần bảng CSDL mới, để người dùng template thấy và copy.
Cập nhật `frontend-forms.md` (khi nào dùng component nào) + 2 bộ rules.

## H3. Kiểm thử frontend (mục 1)

- Công cụ: **Vitest** + Testing Library (`jsdom`), chạy `npm test`; thêm vào CI trước bước build.
- Phạm vi đợt này (logic thuần + hook quan trọng, không test giao diện chi tiết):
  - `useListState` (đọc / ghi URL, đổi lọc → về trang 1), `filters.ts` (chuyển filter → tham số API theo kiểu cột), `columnLayout` (resolve / move / đo độ rộng)
  - định dạng số (`lib/formatters`, 2 kiểu INTL / VN), `normalizeText`, `searchRoutes`
  - `applyServerErrors`, `extractErrorMessage`, bóc envelope của `axiosClient`
  - `metalSpecUtils` (tên NVL tự sinh, tính định lượng)
  - `FormDialog`: gửi lỗi backend → hiện dưới ô; đóng khi còn thay đổi → hỏi xác nhận
  - các component mới ở H2 (`LineItemsField` thêm / xóa / lỗi theo ô)
- Rule mới: logic thuần mới phải kèm test; ghi vào `frontend-architecture.md` + `.agents`.

## H4. Đa ngôn ngữ vi / en (mục 2)

Đề xuất kỹ thuật:
- Thư viện **`next-intl`** (hỗ trợ App Router / Server Components). Ngôn ngữ lưu cookie + chọn trong menu tài khoản, **không** thêm `/vi` `/en` vào URL (ứng dụng nội bộ, không cần SEO).
- Tệp chữ `client/messages/vi.json`, `en.json` chia theo namespace (`common`, `list`, `form`, `auth`, `settings`, từng module). Tiếng Việt là mặc định và là nguồn chuẩn; thiếu khóa ở `en` → dùng `vi`.
- Chuyển toàn bộ chữ cứng trong `components/*` và `modules/*` sang khóa; định dạng ngày / số theo ngôn ngữ đang chọn (kết hợp `useNumberFormat`).
- Khuôn `gen:module` sinh sẵn namespace cho module mới.
- Kiểm tra thiếu khóa: script so khóa `vi` ↔ `en` chạy trong CI.
- Backend: thông báo lỗi API giữ tiếng Việt đợt này (xem Q3).
- Tên menu / phân hệ đang lưu trong CSDL (`ModuleRegistries.module_name`) → xem Q2.

---

## Câu hỏi cần chốt trước khi code

- **Q1. Trang `/examples`:** hiện cho ai?
  (a) chỉ khi chạy dev (`NODE_ENV=development`), production ẩn hẳn — *đề xuất*;
  (b) luôn có, đăng ký như 1 phân hệ trong menu, chỉ quản trị viên thấy.
- **Q2. Tên menu / phân hệ theo ngôn ngữ:** hiện chỉ có `module_name` tiếng Việt trong CSDL.
  (a) thêm cột `module_name_en` vào `ModuleRegistries` (cần sửa DBML — sẽ gửi đoạn DBML để duyệt) — *đề xuất*;
  (b) frontend dịch theo `module_code` trong tệp chữ, CSDL giữ nguyên.
- **Q3. Lỗi từ API (backend):** đợt này giữ tiếng Việt (*đề xuất*), hay dịch luôn backend (Django gettext + `Accept-Language`)?
- **Q4. Thứ tự:** H1 → H2 → H3 → H4 như trên (H4 lớn nhất, làm cuối để chuyển chữ 1 lần cho cả component mới của H2)?

## Trả lời (2026-09-28)
- Q1: `/examples` chỉ khi chạy dev.
- Q2: menu có tiếng Anh → đề xuất DBML bên dưới (chờ duyệt).
- Q3: đang cân nhắc — đề xuất xem mục "Lỗi API đa ngôn ngữ".

### Đề xuất DBML — `ModuleRegistries`
Tiêu đề / mô tả trang (`useModuleHeader`) cũng lấy từ bảng này nên dịch cả mô tả:
```dbml
  ModuleName varchar(255) [not null, note: 'Tên hiển thị tiếng Việt (ngôn ngữ mặc định)']
  ModuleNameEn varchar(255) [null, note: 'Tên hiển thị tiếng Anh; trống -> dùng ModuleName']
  Icon varchar(100) [null, note: 'Khóa icon trong constants/iconMap (lucide), vd UserOutlined, AppstoreOutlined']
  ...
  Description text [null, note: 'Mô tả phạm vi phân hệ (tiếng Việt)']
  DescriptionEn text [null, note: 'Mô tả tiếng Anh; trống -> dùng Description']
```
API `/navigation/` và danh sách phân hệ trả tên theo ngôn ngữ của request (`Accept-Language`); form phân hệ ở Cài đặt có thêm 2 ô tiếng Anh; `seed_core` điền sẵn tiếng Anh cho các phân hệ lõi.

### Lỗi API đa ngôn ngữ (đề xuất: có, làm trong H4)
Frontend không tự dịch được hết vì lỗi nghiệp vụ nằm rải rác trong serializer / service. Cách làm gọn:
- Django `LocaleMiddleware` + `LANGUAGES = [vi, en]`, mặc định `vi`; `axiosClient` gửi `Accept-Language` theo ngôn ngữ đang chọn.
- Chuỗi lỗi / thông báo trong code bọc `gettext_lazy` (giữ nguyên chữ tiếng Việt làm khóa), thêm `server/locale/en/LC_MESSAGES/django.po`. Lỗi mặc định của Django / DRF đã có sẵn bản dịch.
- `code` của lỗi (`validation_error`, `business_rule`…) giữ nguyên để frontend rẽ nhánh, không phụ thuộc ngôn ngữ.
- Dữ liệu nghiệp vụ trong CSDL (tên NVL, tên quyền…) **không** dịch; chỉ menu / phân hệ như trên.
- CI: `makemessages` rồi kiểm tra `.po` không còn chuỗi chưa dịch.

## Nhật ký thực hiện
| Ngày | Mục | Nội dung |
|---|---|---|
| 2026-09-28 | — | Tạo plan Phase H, chờ duyệt |
| 2026-09-28 | — | User duyệt plan, DBML ModuleRegistries, thứ tự H1 → H4 |
| 2026-09-28 | H1 | Xong: dựng lại từ clone sạch (CSDL trống) → bootstrap → startmodule + gen:module → bấm thử CRUD + đổi thương hiệu → bỏ module mẫu → test / build. Sửa: `bootstrap --demo` crash cp1252 trên Windows; `client/.env.example` chưa từng được commit; `.env.example` trỏ URL Neon giả; sửa bản ghi (ĐVT, nhóm NVL, vai trò, phân hệ, module sinh) báo thiếu mã vì dùng PUT → PATCH; lưu Cấu hình hệ thống luôn 400 (Radix Select đặt ""); cache Redis trùng khóa giữa các dự án (quyền / menu lẫn nhau). Cải tiến: phân quyền theo app (`rbac.py`, seed_core tự gom) → bỏ module mẫu chỉ còn xóa thư mục + 2 dòng; vai trò có sẵn nhận quyền của phân hệ mới; menu đưa phân hệ mồ côi nhóm cha lên cấp 1; Tổng quan co theo số khối; CI thêm job "Khuôn sinh phân hệ". Test backend 65/65, clone không module mẫu 52/52 |
| 2026-09-29 | H2 | Hoãn theo yêu cầu user; chuyển sang H4 |
| 2026-09-29 | H4 | ĐANG LÀM (commit tạm nhánh `wip/h4-i18n`). Xong: DBML + model ModuleNameEn/DescriptionEn (migration auth 0006), menu theo Accept-Language (cache theo ngôn ngữ), LocaleMiddleware, gettext trong Dockerfile; next-intl (cookie NEXT_LOCALE, messages/<vi|en>/<ns>.json, khóa có kiểm tra kiểu, `npm run i18n:check`), chọn ngôn ngữ ở menu tài khoản; đã chuyển: bộ khung (list/detail/form/controls/layout/lỗi), units, settings, materials, material-categories, khuôn gen:module (--label-en). CÒN: (1) fork users/profile/audit-logs/dashboard/auth/notifications/attachments/dataTransfer/numberFormat bị dừng giữa chừng — rà lại, tsc còn lỗi `audit-logs/View.tsx` (AUDIT_CSV_COLUMNS); (2) backend: rà các chuỗi đã bọc `_()`, dịch nốt msgstr rỗng trong `server/locale/en/LC_MESSAGES/django.po`, compilemessages, test Accept-Language, CI (gettext + kiểm tra chưa dịch); `profile_shape_display` cần bản EN; (3) CI frontend thêm `npm run i18n:check`; (4) TEMPLATE.md 3.1 còn gạch đầu dòng cũ về `--reset-role-permissions`; (5) form sửa NVL từ trang chi tiết: ô Nhóm trống lúc mới mở (kiểm tra); (6) test backend + tsc/lint/build + QA vi/en toàn bộ màn hình rồi merge vào main |
| 2026-09-30 | H4 | Xong: rà phần fork dừng giữa chừng (cột CSV nhật ký), backend 306 chuỗi đã dịch 100%, CI kiểm tra chuỗi chưa dịch + `npm run i18n:check`, test `.mo` khớp `.po`; form sửa NVL đợi cây nhóm tải xong mới mở; TEMPLATE mục 3b + rules backend. QA 13 màn hình vi / en không lỗi, không thiếu khóa; test backend 69/69, tsc / ESLint / build sạch |
| 2026-09-30 | H3 | Theo yêu cầu user chỉ cài hạ tầng, chưa viết test: Vitest 4 + Testing Library + jsdom (`vitest.config.ts`, `src/test/setup.ts`, `renderWithProviders`), `npm test` (--passWithNoTests) chạy trong CI; rule `testing.md` (hai bộ) — chọn Django TestCase / Vitest / Playwright theo tình huống |
| 2026-09-30 | H3 | Viết test lõi (62 test, 8 tệp): `filters`, `useListState`, `columnLayout`, định dạng số INTL / VN + ô nhập số, `normalizeText`, `searchRoutes` (Ctrl+K), `errorUtils` + `applyServerErrors`, `FormDialog` (validate, lỗi backend theo ô / toast, hỏi lại khi đóng). Test bắt được lỗi: `FormDialog` đọc `formState.isDirty` chỉ trong callback → có lúc đóng luôn không hỏi "Bỏ thay đổi chưa lưu?" — đã sửa + ghi bẫy. `setup.ts` thêm `cleanup` sau mỗi test |
