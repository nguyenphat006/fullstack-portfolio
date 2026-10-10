---
description: "Sổ tay các lỗi đã xảy ra và đã sửa (Known Pitfalls) — Backend & Frontend. Bắt buộc đọc để không lặp lại."
globs: ["**/*"]
always_apply: true
---

# 🧯 SỔ TAY LỖI ĐÃ GẶP & QUY TẮC PHÒNG TRÁNH (KNOWN PITFALLS)

Mỗi dòng là một lỗi **đã thực sự xảy ra** trong dự án. Khi sửa xong lỗi mới có khả năng lặp lại → bổ sung vào đây (xem `05-continuous-learning.md`).

## 1. Backend (Django / DRF)
| Lỗi đã xảy ra | Quy tắc phòng tránh |
|---|---|
| Nút "Xuất Excel" báo 403 với mọi user thường: map quyền khai key `'export'` nhưng action thật tên `export_excel` → đòi quyền `*_EXPORT_EXCEL` không tồn tại | Key trong `custom_action_permissions` = **tên method** của action. Action chuẩn đã có trong `DEFAULT_ACTION_PERMISSIONS`, không khai lại. Có test "user chỉ có `X_EXPORT` gọi được `export-excel/`". |
| ViewSet quên `permission_module` → mọi user đăng nhập đều truy cập được (fail-open); Audit Logs từng mở cho tất cả | `ModulePermissionChecker` fail-closed. ViewSet dữ liệu nghiệp vụ luôn khai `permission_module`. |
| Sinh mã NVL cấp lại mã của bản ghi đã xóa mềm → vi phạm `unique` ở DB, cả 5 lần retry đều trùng | Cột `unique=True`: kiểm tra trùng / tìm mã lớn nhất dùng `Model.all_objects` (gồm bản ghi xóa mềm). |
| Logic chống trùng mã trong service không bao giờ chạy vì `ModelSerializer` tự thêm `UniqueValidator` chặn trước | Trường do hệ thống cấp giá trị: `extra_kwargs = {'field': {'validators': []}}`; kiểm tra trùng ở `validate_<field>` (update) và service (create). |
| Xóa được ĐVT / nhóm NVL đang được sử dụng (xóa mềm không kích hoạt `on_delete=PROTECT`) | Thực thể được FK tham chiếu phải có `check_can_destroy` kiểm tra quan hệ ngược. |
| N+1 query: serializer đọc `created_by.full_name`, `children.count` cho từng dòng | `source='fk.field'` → `select_related('fk')` (kể cả `created_by`, `updated_by`); đếm quan hệ → `annotate(Count(...))`. |
| Đổi quyền ở 1 process, process khác vẫn giữ quyền cũ 30 phút (`LocMemCache` riêng từng process) | Cache dùng chung chạy Redis qua `REDIS_CACHE_URL`. |
| Test chạy trên Neon dùng chung → `database "test_…" is being accessed by other users`; trên Windows `localhost:5432` trúng PostgreSQL cài sẵn thay vì container | Test chạy trong container `portfolio_backend` với `TEST_DATABASE_URL=…@db:5432/…`. |
| View tự `return Response(serializer.errors, 400)` → lệch định dạng lỗi, Frontend không map được vào form | Lỗi luôn `raise` (xem `03b-backend-api-contract.md`). |
| Payload hàng loạt mỗi module một kiểu (`unit_ids`, `category_ids`, `user_ids`) | Chỉ dùng `{"ids": [...]}` + action hàng loạt của `BaseERPViewSet`. |
| OpenAPI sinh sai kiểu (`SerializerMethodField` thành `string`, APIView bị bỏ qua) | Type hint / `@extend_schema_field`; `spectacular` phải 0 warning. |
| Django 5.1 chạy tiếp sau khi hết hạn hỗ trợ, tích 7 lỗ hổng đã công bố | Backend luôn ở bản **LTS** (hiện 5.2). Dependabot không nâng được khi `requirements.txt` chặn trần phiên bản → rà `pip-audit` mỗi khi bump major/minor. |
| `DEBUG` mặc định `True`, `SECRET_KEY` có giá trị dự phòng cứng trong code | `DEBUG` mặc định `False`; thiếu `SECRET_KEY` khi `DEBUG=False` → `ImproperlyConfigured`. Cấu hình production qua env (`SECURE_*`, `CSRF_TRUSTED_ORIGINS`). |
| Chạy lại lệnh seed đặt lại mật khẩu admin về mặc định và xóa ma trận quyền đã chỉnh trên UI; `seed_data` import app không tồn tại nên luôn crash | Lệnh seed phải idempotent và **không ghi đè dữ liệu người dùng đã sửa**: chỉ tạo khi chưa có, chỉ gán quyền cho vai trò mới; ghi đè phải qua cờ tường minh (`--reset-role-permissions`). Mật khẩu admin lấy từ env `ADMIN_PASSWORD`. Mọi lệnh seed có test (`apps/authentication/tests_seed.py`). |
| Tái sử dụng một instance serializer cho 2 trường (`database = x; cache = x`) → OpenAPI chỉ còn 1 trường, types frontend thiếu `database` | Mỗi trường lồng tạo instance riêng (`HealthComponentSerializer()` hai lần) hoặc dùng class; kiểm tra lại types sinh ra sau `gen:api`. |
| Git Bash trên Windows đổi tham số `/master-data/x` thành `C:/Program Files/Git/master-data/x` khi gọi `python` / `docker exec` | Tham số đường dẫn truyền **không có "/" đầu** (`--route master-data/x`); lệnh tự kiểm tra và báo lỗi nếu nhận dạng ổ đĩa. Script gọi `docker exec` dùng `MSYS_NO_PATHCONV=1`. |
| User có `USER_UPDATE` tự gán vai trò `ADMIN` cho mình hoặc đặt lại mật khẩu admin → chiếm toàn quyền | Serializer kiểm tra người thao tác: chỉ Quản trị viên gán `ADMIN` / sửa tài khoản Quản trị viên (403); không tự đổi vai trò. Có test hồi quy (`tests_security.py`). |
| API tệp đính kèm chỉ cần đăng nhập, `file_url` là đường dẫn media công khai → ai cũng xem / xóa được tệp của mọi thực thể | Quyền theo thực thể cha (`attachment_access.py`) + link ký hết hạn; nginx chặn `/media/attachments/`. |
| Mật khẩu mặc định cứng (`123456`, `Abc@2026!`) khi tạo / nhập người dùng | Bắt buộc nhập mật khẩu ≥ 8 ký tự; không hardcode mật khẩu. |
| Mã quyền cũ (`AUDIT_*`, `SYSTEM_CONFIG`) còn trong ma trận sau khi đổi mã phân hệ | Thêm vào `OBSOLETE_PERMISSIONS` của `seed_core`. |
| `CustomUser` kế thừa `AbstractUser` trước `SoftDeleteModel` → `User.objects` là `UserManager` của Django, **không** lọc xóa mềm → tài khoản đã xóa vẫn hiện trong API | Model kế thừa `AbstractUser` / lớp có manager riêng: kiểm tra `Model.objects` thực tế; ViewSet lọc `deleted_at__isnull=True`. Có test "xóa xong GET chi tiết → 404". |
| Hai dự án clone từ template dùng chung 1 Redis với `KEY_PREFIX` cố định → cache menu / quyền của user cùng id lẫn sang dự án kia | `KEY_PREFIX` = `CACHE_KEY_PREFIX` hoặc tên CSDL; mỗi dự án một tiền tố. |
| Bỏ module mẫu phải sửa tay ~30 khối trong `seed_core.py`; phân hệ con có nhóm cha đã bỏ biến mất khỏi menu | Phân hệ / quyền / quyền theo vai trò khai trong `apps/<app>/rbac.py`, `seed_core` tự gom (`apps/core/rbac_registry.py`); `/modules/navigation/` đưa phân hệ mồ côi nhóm cha lên cấp 1. Code lõi không phụ thuộc cứng app mẫu `master_data`. |
| `bootstrap --demo` crash `UnicodeEncodeError` trên console Windows (cp1252) khi in tiếng Việt | `manage.py` ép stdout/stderr UTF-8. |
| Thêm phân hệ vào dự án đang chạy: `seed_core` chỉ gán quyền cho vai trò mới nên MANAGER / STAFF có sẵn không nhận quyền phân hệ mới | Vai trò đã có được bổ sung các quyền **vừa tạo lần đầu**; ADMIN luôn nhận mọi quyền. |

## 2. Frontend (Next.js / shadcn/ui)
| Lỗi đã xảy ra | Quy tắc phòng tránh |
|---|---|
| Refresh token hỏng sau khi backend bọc envelope: đoạn refresh dùng `axios` gốc nên không qua interceptor | Mọi request đi qua `axiosClient` / `http<T>`. Buộc dùng `axios` gốc / `fetch` thì tự đọc `isApiEnvelope(body) ? body.data : body`. |
| Dashboard thống kê luôn hiện 0 vì đọc `res.data` từ kết quả đã bóc envelope | Cấm `res.data \|\| res`, `(res as any)?.data?.results`. Kiểu trả về khai ở service (`http.get<T>`). |
| Vai trò, phân hệ, tệp đính kèm, tab nhật ký chỉ lấy **trang đầu 10 bản ghi** rồi dùng như toàn bộ → bản ghi thứ 11 biến mất | API danh sách luôn phân trang. Danh mục nhỏ cần "toàn bộ" → `params: { page_size: 100 }` + `.results`; danh sách lớn → phân trang server-side / remote search. |
| Lỗi của request tải file (`responseType: "blob"`) là Blob → không đọc được thông điệp | Dùng `await extractErrorMessageAsync(error, "…")`. |
| `catch (err: any)` đọc `err.response.data.detail` thủ công → vỡ khi đổi định dạng lỗi | Không `: any` trong `catch`; chỉ dùng `extractErrorMessage` / `applyServerErrors` / `getErrorCode`. |
| Route trùng `/units` và `/master-data/units` | Mỗi màn hình một route, khớp `route_path` trong `seed_core`. |
| Component 800–1000 dòng (FilePreviewModal, ModuleTable, MaterialFormModal) | File > ~400 dòng → tách khối con + hàm thuần (`*Utils.ts`) vào thư mục con. |
| Thư viện `xlsx` bản npm có lỗ hổng mức cao, không có bản vá | Dùng bản SheetJS chính thức từ CDN (`https://cdn.sheetjs.com/xlsx-<ver>/xlsx-<ver>.tgz`). Dependabot **không** theo dõi dependency dạng URL → tự kiểm tra bản mới khi có tin bảo mật. |
| `schema.yml` / `api.generated.ts` bị Git trên Windows đổi sang CRLF → CI báo "đã cũ" dù nội dung giống | File sinh tự động cố định `eol=lf` trong `.gitattributes`. |
| Hydration mismatch mỗi lần F5 khi đã đăng nhập: store đọc `localStorage` lúc nạp module, server render màn hình chờ còn client render nội dung | Component phụ thuộc `localStorage` render giống server ở lần đầu (`useMounted()`) rồi mới hiện nội dung thật (xem `AuthGuard`). |
| Dark mode: banner Dashboard mất chữ vì gradient dùng biến màu chữ; số liệu MetricCard chìm vì mặc định `#0F172A` | Theo mục "Giao diện sáng / tối": nền thương hiệu dùng màu cố định, giá trị mặc định dùng `var(--c-text)`. Kiểm tra bằng ảnh chụp cả 2 chế độ. |
| Hook cập nhật hồ sơ ghi `localStorage["user"]` trong khi store đọc `user_profile` → topbar không đổi tên | Cập nhật user qua `useAuthStore.getState().updateUser(...)`, không ghi `localStorage` thủ công. |
| Next 16 đổi prop `error.tsx` từ `reset` sang `retry` | Trước khi dùng file convention / API Next, đọc `node_modules/next/dist/docs/` (xem `client/AGENTS.md`). |
| Breadcrumb tạo link tới đường dẫn không có trang (`/settings`, `/master-data`) → bấm ra 404, Next prefetch treo khiến trang không bao giờ "network idle" | Breadcrumb lấy nhãn + link từ cây menu (`useNavigation`); đoạn không phải trang thật không được là link. |
| `package-lock.json` tạo bằng npm 11 trên Windows thiếu optional deps của Linux (`@emnapi/*`) → `npm ci` trên CI/Docker báo "not in sync" | CI và Dockerfile dùng `npm install --no-audit --no-fund`; khi cập nhật lock có thể sinh bằng container Linux (`docker run node:22-alpine npm install --package-lock-only`). |
| Trang chi tiết / Cài đặt hiện nút Sửa, Xóa, Xuất, ma trận quyền cho user chỉ có quyền xem; `MaterialDetailHero` có `canUpdate = true` mặc định nhưng View không truyền; gõ URL không có quyền ra trang lỗi API | Gate theo checklist ở `02a` mục 5b; `RouteGuard` trả 403 cho route ngoài cây menu; không để nút chưa có chức năng (nút "Nhập Excel" giả). |
| "Đổi mật khẩu" ở chi tiết người dùng đổi mật khẩu của chính người xem (dùng nhầm `ChangePasswordModal`) | Thao tác trên tài khoản khác gọi API của tài khoản đó (`ResetPasswordModal` → `PATCH /users/{id}/`). |
| Form tạo người dùng mặc định gán `role_ids: [1]` (ADMIN), vai trò dự phòng viết cứng kèm ID | Không mặc định theo ID bản ghi CSDL; options lấy từ API khi mở form. |
| Nút xuất / nhập giả chỉ hiện thông báo | Dùng `useExcelExport` / `ExcelImportModal`; chưa có chức năng thì không hiện nút. |
| Mỗi module tự viết FilterToolbar / Table / Hero dài, lệch giao diện | `ListPage` (02c) và `DetailPage` (02d); module chỉ khai báo cấu hình. |
| Đồng bộ state trong render (`if (source !== data) setRows(...)`) với `const { data = [] } = useQuery()` → mỗi render một mảng mới → "Too many re-renders" (ma trận quyền, bảng phân hệ) | Giá trị mặc định rỗng là hằng số cấp module (`const NO_ROLES: RoleItem[] = []`); không viết `= []` trong destructuring khi giá trị đó được so sánh tham chiếu. |
| Thời dùng Ant Design, CI kiểm tra bằng `antd lint` (luôn exit 0, phải grep output); bỏ antd thì không còn kiểm tra tĩnh nào ngoài tsc | CI chạy `npm run lint -- --max-warnings=0` (ESLint `eslint-config-next` + `react-hooks`); sửa lỗi thật, chỉ `eslint-disable-next-line` kèm lý do khi quy tắc không áp dụng. |
| shadcn CLI sinh `import { cn } from "cn"` (gói `cn` chính thức của shadcn) trong `components/ui`, còn code dự án dùng `clsx + tailwind-merge` riêng → hai bộ gộp class | `@/lib/utils` re-export `cn` từ gói `cn`; code dự án import `cn` từ `@/lib/utils`, không cài lại clsx / tailwind-merge. |
| Sửa bản ghi báo "Mã: trường này là bắt buộc": form sửa chỉ gửi trường được sửa nhưng service gọi `PUT` | Cập nhật luôn dùng `PATCH` (`createCrudService().update`, service tự viết cũng vậy). |
| Lưu Cấu hình hệ thống luôn 400 `"" is not a valid choice`: Radix Select gọi `onValueChange("")` khi `form.reset` | `SelectField` bỏ qua giá trị rỗng. QA form phải bấm Lưu thật, không chỉ mở form. |
| `client/.gitignore` có `.env*` nên `client/.env.example` chưa từng được commit | Thêm `!.env.example` sau luật `.env*`; kiểm tra bằng `git ls-files`. |
| `FormDialog` đôi khi đóng không hỏi lại: `form.formState.isDirty` chỉ đọc trong callback nên react-hook-form không theo dõi | Đọc `formState` trong lúc render (`const { isDirty } = form.formState`) hoặc `useFormState`, rồi dùng trong callback. |
| Combobox không cuộn được: khung danh sách flex cột làm khối ảo hóa bị co; trong Dialog, danh sách portal ra ngoài bị `RemoveScroll` của Dialog chặn wheel | Danh sách ảo hóa trong khung `display: block`; nội dung popover portal bọc `<RemoveScroll removeScrollBar={false}>`. QA Combobox phải cuộn thử cả trong form modal. |
