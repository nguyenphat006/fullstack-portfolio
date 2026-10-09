---
paths:
  - "client/src/**"
---

# Frontend — trang chi tiết (`components/detail`)

Thiết kế: `docs/plan/ui-list-detail-design.md` mục 2. Mẫu: `modules/master-data/materials/MaterialDetailView.tsx`, `modules/users/UserDetailView.tsx`.

## URL
`/[module]` danh sách · `/[module]/[id]` chi tiết (deep-link được, tab đang mở ở `?tab=`).

## Khai báo — DetailPage lo Hero, Tabs, breadcrumb, Skeleton, 404
```tsx
<DetailPage<MaterialItem>
  query={useMaterialDetail(id)} backHref="/master-data/materials" entityLabel="nguyên vật liệu"
  hero={(m) => ({ title: m.material_name, image: m.image_url, code: m.material_code,
    badges: [<StatusBadge key="s" map={ACTIVE_STATUS} value={m.is_active} />],
    subtitle: [m.category_name, m.base_uom_name], updatedAt: m.updated_at, updatedBy: m.updated_by_name,
    fields: [{ label: "Quy cách", value: formatMaterialSpec(m) }, { label: "Mô tả", value: m.description, wide: true }] })}
  onEdit={can(X.UPDATE) ? openEdit : undefined}
  moreActions={(m) => [{ key: "delete", label: "Xóa", danger: true, confirm: {...}, onClick: can(X.DELETE) ? remove : undefined }]}
  tabs={(m) => [{ key: "specs", label: "Quy cách & bản vẽ", children: <SpecsTab material={m} /> }]}
  attachments={{ entityType: "Material", entityId: id, readonly: !can(X.UPDATE) }}
  audit={{ model: "master_data.material", objectId: id }}
/>
```

## Nguyên tắc
- Hero tầng 1: ảnh 64px (không ảnh → chữ viết tắt), tên, tối đa 2 badge, mã monospace, dòng phụ 2–3 thông tin; cụm nút bên phải (DetailPage tự dựng): "← Quay lại" (có chữ) · ⟳ Làm mới (tải lại mọi API đang hiển thị trên trang, trừ query khung ứng dụng) · **1 nút chính** "Chỉnh sửa" · `⋯` (mục không có `onClick` tự ẩn; xóa ở cuối, đỏ, sau divider; `disabledReason` để khóa kèm lý do).
- Tầng 2: tối đa 8 trường, còn lại sau "Xem thêm"; trường `wide` rỗng tự ẩn.
- **Không lặp**: thông tin ở tầng 1 (dòng phụ, badge) không lặp ở lưới thuộc tính hay trong tab. Tab chỉ có khi có nội dung riêng (vd. tab quy cách chỉ cho NVL kim loại).
- Tab nghiệp vụ đặt trước; "Tệp đính kèm" (có số lượng) và "Nhật ký" (`EntityAuditTab`, cần `AUDIT_LOGS_READ`) do khung thêm. Nhật ký là dòng thời gian theo ngày; mỗi mục hiện sẵn người thực hiện + vai trò, thao tác, phân hệ, giờ và **mọi trường thay đổi** (nhãn trường: cũ → mới, do API `/audit-logs/` trả `label` / `*_display`), không bắt bấm mới thấy. Mỗi tab tự tải dữ liệu khi mở.
- Không vẽ breadcrumb / nút "Quay lại" riêng trong module — breadcrumb ở Topbar, nút "Quay lại" và "Làm mới" trong cụm nút của Hero.
- **Trang chi tiết luôn mở ở chế độ xem**; cách sửa chọn theo từng thực thể (chốt 2026-10-03), không ép một kiểu chung:
  | Cách sửa | Khi nào | Ví dụ |
  |---|---|---|
  | Modal `FormDialog` từ nút "Chỉnh sửa" | Thực thể gọn (< ~12 trường, 1 bước) | ĐVT, nhóm, vai trò, người dùng, NVL |
  | Sửa trong trang xem (từng khối / tab có nút "Sửa" → thành form, Lưu / Hủy riêng khối đó) | Hồ sơ nhiều tab, mỗi lần chỉ sửa một phần | Mẫu sản phẩm, biến thể, cây linh kiện, định mức |
  | Trang riêng `/[module]/[id]/edit` | Sửa cần cả màn hình: wizard nhiều bước, bảng dòng con lớn | BOM Builder, lệnh sản xuất |
  - Không có quyền sửa / bản ghi bị khóa (vd. BOM đã duyệt, đóng băng) → ẩn nút "Sửa" của khối / trang, chỉ còn chế độ xem.
  - Sửa trong trang xem: mỗi khối dùng `useForm` riêng + `applyServerErrors`, khối đang sửa mà rời trang / chuyển tab thì hỏi "Bỏ thay đổi chưa lưu?" như `FormDialog`.
- Thao tác trên **tài khoản khác** (đặt lại mật khẩu…) gọi API của tài khoản đó — không dùng component của "tài khoản của tôi" (`ChangePasswordModal`).
