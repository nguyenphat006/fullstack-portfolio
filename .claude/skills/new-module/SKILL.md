---
name: new-module
description: Quy trình dựng một module CRUD mới end-to-end cho Admin Template — từ bảng trong DBML tới Django model/serializer/viewset/RBAC và module Next.js (types, service, hooks, table, filter, form modal, view, trang chi tiết). Dùng khi user yêu cầu thêm màn hình/danh mục/thực thể mới (vd. Customers, ProductCategories, Finishes).
argument-hint: "<TênBảngDBML> [app_django] [đường-dẫn-route]"
---

# Dựng module mới: $ARGUMENTS

Làm lần lượt; mỗi bước đọc file mẫu tương ứng thay vì đoán. Mẫu chuẩn:
- Backend: `server/apps/master_data/` (UnitOfMeasure — đơn giản; Material — có FK, sinh mã, chi tiết).
- Frontend: `client/src/modules/master-data/units/` (danh sách) và `.../materials/` (danh sách + chi tiết).

## 0. Xác nhận thiết kế
1. Tìm bảng trong `server/database.dbml`. Không có → dừng, đề xuất DBML và chờ user duyệt.
2. Chốt với user (nếu chưa rõ): app Django đặt ở đâu, route frontend, có trang chi tiết `/[id]` không, form Modal hay trang riêng, có xuất/nhập Excel không.
3. Liệt kê kế hoạch file sẽ tạo/sửa rồi mới code (trừ khi user đã phê duyệt phạm vi).

## 0b. Dùng công cụ sinh (mặc định)
Với thực thể dạng danh mục (mã + tên + mô tả + trạng thái), chạy bộ sinh rồi chỉ bổ sung trường nghiệp vụ:
1. `python manage.py startmodule <app> <Model> --label "<tên>" --route <nhóm/đường-dẫn> --parent <MODULE_CHA>` (route không có "/" đầu).
2. Dán bảng DBML in ra vào `server/database.dbml`; thêm trường theo DBML vào `models.py`, `serializers.py` (+ cột/ô form ở frontend sau bước 4).
3. `makemigrations` → `migrate` → `seed_core` → test app → `spectacular --file schema.yml`.
4. `cd client && npm run gen:api && npm run gen:module -- --entity <Model> --label "<tên>" --route <nhóm/đường-dẫn> --code <MÃ>` (dùng đúng lệnh `startmodule` in ra).
5. Quyền mặc định theo vai trò: sửa `ROLE_PERMISSIONS` trong `apps/<app>/rbac.py`.
6. Chạy skill `verify`, rồi mở màn hình và **bấm thử** tạo / sửa / xóa (lưu thật). Chỉ làm theo các bước thủ công bên dưới khi thực thể không hợp khuôn (cây, chứng từ nhiều dòng...).

## 1. Backend
1. **Model** (`apps/<app>/models.py`): kế thừa `AuditModel`, `@pghistory.track(...)`, `db_table` = tên bảng DBML, field snake_case, Decimal đúng độ chính xác, `Meta.ordering` + index `['-updated_at', 'id']`, `__str__`.
2. **Serializer**: `XxxSerializer` (đọc — dùng cho MỌI response, kèm `*_name` của FK) và `XxxCreateUpdateSerializer` (ghi, validate nghiệp vụ, message tiếng Việt). `SerializerMethodField` phải có type hint trả về (`-> int`, `-> list[str]`) hoặc `@extend_schema_field`. Trường `unique=True` do hệ thống cấp (mã tự sinh) → tắt validator tự động `extra_kwargs = {'code': {'validators': []}}` và kiểm tra trùng bằng `all_objects`.
3. **ViewSet** (mẫu `apps/master_data/views.py` — `UnitOfMeasureViewSet`): kế thừa `BaseERPViewSet`; `serializer_class` + `write_serializer_class`; `queryset` có `select_related('created_by', 'updated_by', <FK>)` + `.order_by('-updated_at', 'id')`; `permission_classes = [IsAuthenticated, ModulePermissionChecker]`, `permission_module`; `filterset_fields`, `search_fields`, `ordering_fields`; `@crud_schema(tag, entity)`.
   - **Không** viết lại `statistics`, `batch-delete`, `batch-status`, export — base đã có.
   - Quy tắc nghiệp vụ: `check_can_destroy` (vd. còn bản ghi con / đang được tham chiếu), `check_can_change_status`, `after_write` → `raise BusinessError("…")`.
   - Lỗi: luôn `raise` (`ValidationError`, `BusinessError`, `NotFound`), không `return Response(errors, 400)`.
   - Chỉ khai báo `custom_action_permissions` cho action riêng của module.
   - Tính toán / sinh mã → `apps/<app>/services/*.py` (mẫu `master_data/services/material_code.py`).
4. **URL**: `router.register(r'<kebab-plural>', XxxViewSet, basename='<kebab>')`.
5. **RBAC**: tạo `apps/<app>/rbac.py` (mẫu `apps/master_data/rbac.py` / khuôn `apps/core/module_template/rbac.py.tpl`): `MODULES`, `PERMISSIONS = crud_permissions('<CODE>', '<nhãn>')`, `ROLE_PERMISSIONS`. Không sửa `seed_core.py`; chạy `python manage.py seed_core`.
6. **Test** `apps/<app>/tests.py` (mẫu `apps/master_data/tests.py`): list/create/validation theo envelope, user thiếu quyền → 403, mọi hook nghiệp vụ, mọi service tính toán.
7. Chạy `makemigrations` → `migrate` → `check` → test (lệnh trong rule backend) → `python manage.py spectacular --file schema.yml` (0 warning).

## 2. Frontend
1. `npm run gen:api` → dùng kiểu sinh tự động: `types.ts` khai báo `export type XxxItem = Schemas["Xxx"]`, `XxxCreateInput = Schemas["XxxCreateUpdateRequest"]` (mẫu `units/types.ts`). Chỉ gõ tay `XxxFilters`.
2. `constants/permissions.ts`: thêm mã quyền khớp backend.
3. `services/<entity>.service.ts`: `createCrudService<Item, Create, Update, Filters>("/xxx/")`; endpoint riêng bổ sung bằng `http.get/post<T>` (mẫu `materials/services`). Danh mục cần lấy "toàn bộ" → truyền `page_size: 100` và đọc `.results`.
4. `hooks/use<Entity>Query.ts`: `XXX_QUERY_KEY = ["xxx"] as const` + `createCrudHooks(KEY, service)`; query riêng đặt key lồng `[...KEY, "…"]`.
5. `components/`:
   - `<Entity>FormModal`: `useForm` + `FormDialog` + trường `@/components/form`; `onSubmit` ném lỗi lại để FormDialog gắn lỗi backend vào ô nhập (mẫu `units/components/UnitFormModal.tsx`, rule `frontend-forms.md`).
   - File > ~400 dòng → tách khối con vào thư mục `components/<entity>-form/`; hàm tính toán thuần tách ra `*Utils.ts`.
6. `<Feature>View.tsx`: `ListPage` + `useListState` + `defineColumns` (mẫu `units/UnitsView.tsx`, rule `frontend-tables.md`). Không tự viết toolbar / table. Batch: `toast.success(res.message)`, có `res.data.skipped` → `toast.warning`. Không MetricCards / thùng rác.
7. Trang chi tiết (nếu có): `<Entity>DetailView.tsx` dùng `DetailPage` (rule `frontend-detail-views.md`); cột tên ở danh sách thêm `link`.
8. `index.ts` barrel + `export { default }`.
9. Route mỏng: `src/app/(admin)/(dashboard)/<route>/page.tsx` (+ `[id]/page.tsx`) chỉ khai báo `metadata` và render View. Route phải khớp `route_path` trong `seed_core` (không tạo route alias trùng).
10. Chạy `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build`.

## 3. Kết thúc
- Chạy skill `verify` cho cả hai phía.
- Tóm tắt file đã tạo/sửa, API endpoint mới, quyền mới, việc còn lại (seed dữ liệu, test tay trên UI).
- Nếu phát sinh quy ước mới trong quá trình làm → đề xuất cập nhật `.claude/rules/`.
