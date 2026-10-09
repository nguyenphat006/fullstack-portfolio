---
paths:
  - "client/src/**"
---

# Frontend — trang danh sách (`components/list`)

Thiết kế: `docs/plan/ui-list-detail-design.md`. Mẫu: `modules/master-data/units/UnitsView.tsx` (đơn giản), `materials/MaterialsView.tsx` (lọc cây / remote), `users/UsersView.tsx` (bản ghi được bảo vệ, nhập Excel). Khuôn sinh: `npm run gen:module`.

## Bố cục (ListPage lo hết, module không tự dựng)
`PageHeader` (1 nút chính "Thêm …") → **một khối `.list-card`** chứa thanh công cụ (tìm kiếm chung · "Bộ lọc" · tag bộ lọc · ⟳ Làm mới · Xuất · Nhập · ⚙) + bảng + phân trang → thanh hàng loạt nổi đáy. (Chốt 2026-10-03, trang chuẩn: Users.)
- **Lọc ở 2 nơi, luôn đồng bộ** (chung trạng thái URL): icon phễu trên header cột (popover: hàng icon ghim trái / phải trên cùng, không tiêu đề → mỗi dòng một kiểu sắp xếp "↑ Tăng dần" / "↓ Giảm dần" → ô lọc / tìm của cột) và nút "Bộ lọc" chung (panel 2 cột, nhãn trên ô nhập, áp dụng một lần). Bộ lọc khai báo **một lần trên cột** (`filter`); muốn lọc theo trường không hiển thị → thêm cột `defaultHidden: true`.
- **Lọc chọn 1 / nhiều** (`select`, `boolean`, `multiSelect`, `remote`) luôn dùng `Combobox` (qua `FilterField`): ở **popover lọc cột** danh sách lựa chọn **hiện sẵn** dưới ô tìm (`variant="inline"`, chọn nhiều có dấu ✓, không chip); ở **panel "Bộ lọc" chung** thu gọn trong ô chọn thả xuống như bình thường. Lọc theo cây dùng `TreeChecklist`. Không dùng Radio / Checkbox / Select của Radix cho bộ lọc.
- Làm mới là nút icon (tooltip); Xuất / Nhập là nút riêng có icon + chữ (mobile chỉ còn icon), chỉ hiện khi có `onExport` / `onImport`; ⚙ giữ riêng: hiện / ẩn, kéo thả đổi thứ tự (dnd-kit, có bản xem trước), ghim, mật độ.
- Không tự thêm MetricCards / KPI, nút phụ trên header, thùng rác (template không có thùng rác).
- Không viết lại FilterToolbar / Table riêng cho module.

## Khai báo
```tsx
const list = useListState({ defaultOrdering: "-updated_at" }); // tìm kiếm, lọc, trang, sắp xếp trên URL
const query = useUnitsList(list.params);
const columns = useMemo(() => defineColumns<UnitItem>([
  { key: "code", title: "Mã", width: 120, pinned: "left", hideable: false, sortable: true, filter: { type: "text" }, render: (v) => <CodeText>{v}</CodeText> },
  { key: "is_active", title: "Trạng thái", width: 130, filter: { type: "select", options: statusOptions(ACTIVE_STATUS) }, render: (v) => <StatusBadge map={ACTIVE_STATUS} value={v} /> },
  { key: "updated_at", title: "Cập nhật", width: 140, sortable: true, filter: { type: "date" }, render: (v, r) => <RelativeTime value={v} by={r.updated_by_name} /> },
]), []);
<ListPage moduleCode="UNIT" tableKey="units" list={list} query={query} columns={columns} entityLabel="đơn vị tính"
  onCreate={can(...) ? openCreate : undefined}
  rowActions={{ onEdit, onDelete, protectedReason, editDisabledReason, more }} bulkActions={[...]} onExport={openExport} />
```
- Lọc theo cột: `text` `<f>__icontains` · `select`/`boolean` `<f>` · `multiSelect`/`tree`/`remote` `<f>__in` · `number` `<f>__gte/__lte` · `date` `<f>__date__gte/__lte`. Đổi tên tham số bằng `param` / `params` (vd. nhật ký `["date_from", "date_to"]`), đổi trường gốc bằng `filterField`.
- Backend khai báo lookup tương ứng: `filterset_fields = {"code": ["icontains"], "updated_at": ["date__gte", "date__lte"]}`; M2M `__in` tự tách chuỗi trong `get_queryset` (+ `distinct()`).
- `sortable: true` → key phải có trong `ordering_fields`.
- Bộ lọc cần dữ liệu lớn (người dùng, ĐVT…) dùng `type: "remote", source: remoteSource({ queryKey, fetchPage, toOption })` (tải khi mở, tìm ở server, cuộn vô hạn), không tải sẵn danh sách khi vào trang.
- Tên / mã bản ghi có trang chi tiết → `link: (r) => "/module/" + r.id`; không thêm nút "Xem".
- Cột thao tác do ListPage dựng: Sửa · Xóa (xác nhận) · ⋯ (`more`). Bản ghi được bảo vệ → `protectedReason` (khóa xóa + ô chọn), `editDisabledReason`.
- Độ rộng: tổng các cột vừa ~1100px ở màn 1440; cột phụ dùng `defaultHidden: true` (bật lại trong ⚙) thay vì làm bảng cuộn ngang.

## Xuất / nhập
- Xuất: `const { openExport, exportModal } = useExcelExport({ endpoint: "/units/", label, list, total })` → `onExport={can(X.EXPORT) ? openExport : undefined}`, đặt `{exportModal}` trong children. Bộ lọc hiện tại gửi qua query string.
- Nhập: `onImport` mở `<ExcelImportModal />`.

## Chọn thực thể động trong form
Select Users/Customers/Materials... dùng remote search + debounce + tải thêm khi cuộn từ API danh sách riêng, không lấy từ `/options/`.
