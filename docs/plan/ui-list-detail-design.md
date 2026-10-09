# Thiết kế trang danh sách & trang chi tiết (Phase F)

> Trạng thái: **ĐỀ XUẤT — chờ user duyệt thiết kế**. Áp dụng cho mọi module; module chỉ khai báo cấu hình.
> Tuân theo `.claude/rules/frontend-ux.md` (gọn, theo lớp, chỉ tải dữ liệu đang hiển thị).

---

## 1. Trang danh sách

### 1.1 Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Nguyên vật liệu                                          [ + Thêm NVL ]      │  ① PageHeader
│ Quản lý danh mục vật tư, quy cách và bản vẽ                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm theo mã, tên…        ] [Trạng thái ▾] [Nhóm ▾] [≡ Bộ lọc · 2]   ⟳  ⤓▾  ⚙ │  ② Toolbar
│ Trạng thái: Hoạt động ×   Nhóm: Gỗ ×   Cập nhật: 01/09–27/09 ×   Xóa lọc     │  ③ Tag bộ lọc (chỉ hiện khi có)
├──────────────────────────────────────────────────────────────────────────────┤
│ ☐ │ Mã ↑ ⋮ │ Tên nguyên vật liệu ⋮ │ Nhóm ⋮ │ ĐVT ⋮ │ Trạng thái ⋮ │ Cập nhật ⋮ │ ✎ 🗑 ⋯ │  ④ Bảng
│ ☐ │ GO-00012 │ Gỗ tràm xẻ sấy 25mm │ Gỗ │ m³ │ ● Hoạt động │ 2 giờ trước │ ✎ 🗑 ⋯ │
│ …                                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ 125 bản ghi                                         ‹ 1 2 3 … 13 ›  20 / trang │  ⑤ Footer
└──────────────────────────────────────────────────────────────────────────────┘
        ┌───────────────────────────────────────────────────────────┐
        │ Đã chọn 3   [Kích hoạt] [Ngưng hoạt động] [Xóa]   Bỏ chọn │          ⑥ BulkActionBar (nổi đáy, khi có dòng chọn)
        └───────────────────────────────────────────────────────────┘
```

| Vùng | Nội dung | Quy tắc |
|---|---|---|
| ① PageHeader | Tiêu đề + 1 dòng mô tả (từ `ModuleRegistries`) · **nút chính duy nhất "Thêm …"** bên phải | Nút chính chỉ ở đây, không lặp trong toolbar. Không có quyền CREATE → không có nút. |
| ② Toolbar trái | Ô tìm kiếm (debounce 300ms) · tối đa **2 bộ lọc nhanh** (bộ lọc hay dùng nhất) · nút "Bộ lọc" có số bộ lọc đang bật | Các bộ lọc còn lại nằm trong Popover "Bộ lọc" (form nhỏ, nút Áp dụng / Đặt lại). |
| ② Toolbar phải | `⟳` tải lại · `⤓▾` Xuất / Nhập (menu, lọc theo quyền) · `⚙` Tùy chỉnh bảng | Chỉ icon + Tooltip. Không có quyền xuất/nhập → ẩn mục đó; không còn mục nào → ẩn nút. |
| ③ Tag bộ lọc | Mỗi bộ lọc đang bật (từ toolbar **hoặc** từ header cột) là 1 tag, `×` để gỡ · "Xóa lọc" | Một nguồn trạng thái duy nhất → toolbar, header cột và tag luôn khớp nhau. |
| ④ Bảng | Checkbox (khi có thao tác hàng loạt) · các cột · cột thao tác ghim phải | Xem mục 1.2 – 1.4. |
| ⑤ Footer | Tổng số bản ghi · phân trang · số dòng / trang (10 / 20 / 50 / 100) | Số dòng / trang lưu theo bảng. |
| ⑥ BulkActionBar | "Đã chọn N" · thao tác hàng loạt (theo quyền) · "Bỏ chọn" | Thay dropdown "Thao tác hàng loạt" hiện tại. Kết quả `skipped` hiện `message.warning`. |

### 1.2 Menu cột thống nhất (Column menu)

Mọi cột dùng chung một menu — bấm `⋮` trên header (hiện khi rê chuột; luôn hiện nếu cột đang lọc / sắp xếp):

```
┌ Mã NVL ──────────────────────┐
│ ↑ Sắp xếp tăng dần        ✓  │
│ ↓ Sắp xếp giảm dần           │
│ ✕ Bỏ sắp xếp                 │
├──────────────────────────────┤
│ Lọc                          │
│ [ chứa…               ]      │   ← ô lọc thay đổi theo kiểu cột (bảng dưới)
│            [Đặt lại] [Lọc]   │
├──────────────────────────────┤
│ 📌 Ghim trái / Ghim phải / Bỏ ghim │
│ ← Chuyển sang trái  → Chuyển sang phải │
│ ↔ Tự vừa độ rộng             │
│ 👁 Ẩn cột                    │
└──────────────────────────────┘
```

- **Bấm tiêu đề cột** = xoay vòng sắp xếp: tăng → giảm → bỏ. Mũi tên nhỏ cạnh tiêu đề cho biết trạng thái. Sắp xếp **một cột** tại một thời điểm, chạy ở server (`ordering`).
- **Icon phễu** trên header tô màu chính khi cột đang lọc.
- Mục nào không áp dụng cho cột đó (không `sortable`, không có `filter`) thì không hiện.

**Ô lọc theo kiểu cột**

| Kiểu `filter.type` | Giao diện | Tham số gửi API |
|---|---|---|
| `text` | Ô nhập "chứa…" | `<field>__icontains` |
| `select` | Danh sách chọn 1 (Radio) | `<field>=` |
| `multiSelect` | Checkbox + ô tìm trong danh sách, "Chọn tất cả" | `<field>__in=a,b` |
| `tree` | TreeSelect (nhóm cha – con) | `<field>__in=` (gồm con) |
| `number` | Từ … đến … | `<field>__gte`, `<field>__lte` |
| `date` | RangePicker + chọn nhanh (Hôm nay, 7 ngày, 30 ngày, Tháng này) | `<field>__date__gte`, `__date__lte` |
| `boolean` | Có / Không / Tất cả | `<field>=true|false` |
| `remote` | Select tìm từ server (debounce, tải thêm khi cuộn) | `<field>__in=` |

### 1.3 Tùy chỉnh bảng (`⚙`)

Popover gọn:
- Danh sách cột: checkbox hiện / ẩn · kéo ⠿ để đổi thứ tự · nút ghim trái / phải.
- Mật độ: Rộng / Vừa / Gọn.
- "Khôi phục mặc định".
- Kéo mép header để **co giãn cột**; nhấp đúp mép = tự vừa nội dung. Độ rộng tối thiểu theo cột.
- Lưu theo user + `tableKey` (như hiện tại), không lưu bộ lọc.

### 1.4 Dòng & cột thao tác

- **Tên / mã bản ghi là link** tới trang chi tiết (màu chính, gạch chân khi rê). Bỏ nút 👁 "Xem" riêng.
- Cột thao tác (ghim phải, rộng 96px): `✎ Sửa` · `🗑 Xóa` · `⋯` (xem nhanh, nhân bản… nếu module có). Chỉ hiện nút có quyền; không còn nút nào → ẩn cả cột.
- Dòng không cho xóa (vd. tài khoản admin): nút xóa disabled + Tooltip lý do; checkbox chọn disabled.
- Cột mặc định cho mọi module: cột định danh (ghim trái), `Trạng thái`, `Cập nhật` (thời gian tương đối, Tooltip giờ đầy đủ + người cập nhật). Không hiện `Ngày tạo`, `Người tạo` mặc định (bật được qua `⚙`).

### 1.5 Trạng thái

| Tình huống | Hiển thị |
|---|---|
| Lần tải đầu | Skeleton 8 dòng theo đúng cột |
| Đổi trang / lọc / sắp xếp | Giữ dữ liệu cũ + thanh tải mảnh trên bảng (không nháy trắng) |
| Chưa có dữ liệu | `EmptyState` "Chưa có … nào" + nút "Thêm …" (nếu có quyền) |
| Lọc không ra kết quả | "Không có kết quả phù hợp" + nút "Xóa lọc" |
| Lỗi tải | Thông điệp + "Thử lại" |

### 1.6 Trạng thái trên URL

`/master-data/materials?q=go&is_active=true&category__in=3,5&ordering=-updated_at&page=2&page_size=20`
- F5, quay lại từ trang chi tiết, gửi link → giữ nguyên danh sách.
- Gõ tìm kiếm dùng `router.replace` (không tạo lịch sử mỗi ký tự); đổi lọc / sắp xếp tự về trang 1.

### 1.7 Mobile (< 768px)

- PageHeader: nút "Thêm" thu thành icon `+`.
- Toolbar: ô tìm kiếm + nút "Bộ lọc" (mở Drawer đáy chứa **tất cả** bộ lọc, kể cả bộ lọc nhanh); các icon phải gom vào `⋯`.
- Bảng: cuộn ngang, cột định danh ghim trái; menu cột mở dạng Drawer đáy.
- BulkActionBar: full width, thao tác vào menu nếu > 2.

### 1.8 Khai báo trong module

```tsx
// modules/master-data/materials/columns.tsx
export const materialColumns = defineColumns<MaterialItem>([
  { key: "material_code", title: "Mã", width: 120, pinned: "left", sortable: true, filter: { type: "text" }, link: (r) => `/master-data/materials/${r.id}` },
  { key: "material_name", title: "Tên nguyên vật liệu", minWidth: 220, sortable: true, filter: { type: "text" } },
  { key: "category", title: "Nhóm", filter: { type: "tree", source: useMaterialCategoryTree }, render: (r) => r.category_name },
  { key: "is_active", title: "Trạng thái", filter: { type: "select", options: STATUS_OPTIONS }, render: statusRender },
  { key: "updated_at", title: "Cập nhật", sortable: true, filter: { type: "date" }, render: relativeTimeRender },
]);

// MaterialsView.tsx
<ListPage
  moduleCode="MATERIAL"
  columns={materialColumns}
  query={useMaterialsList}
  quickFilters={["is_active", "category"]}
  onCreate={can(MATERIAL.CREATE) ? openCreate : undefined}
  rowActions={{ onEdit: can(MATERIAL.UPDATE) ? openEdit : undefined, onDelete: can(MATERIAL.DELETE) ? remove : undefined }}
  bulkActions={bulkActionsByPermission}
  exportImport={{ onExport: can(MATERIAL.EXPORT) ? openExport : undefined }}
/>
```

**Backend đi kèm:** `ERPFilterSet` (django-filter) sinh lookup theo khai báo (`icontains`, `in`, `gte/lte`, `date__gte/lte`); `ordering_fields` khớp cột `sortable`. Test: mỗi kiểu lọc 1 case.

---

## 2. Trang chi tiết

### 2.1 Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ←  [ảnh 64]  Gỗ tràm xẻ sấy 25mm   ● Hoạt động  GO-00012     [✎ Chỉnh sửa] [⋯] │  ① Hero tầng 1
│              Gỗ · m³ · Cập nhật 2 giờ trước bởi Nguyễn A                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Nhóm            Đơn vị tính      Quy cách           Hao hụt                    │  ② Hero tầng 2
│ Gỗ tự nhiên     m³               25 × 100 × 2000    5,0 %                      │     (lưới thuộc tính)
│ Nhà cung cấp    Ghi chú …                                  [Xem thêm ▾]        │
└──────────────────────────────────────────────────────────────────────────────┘
  Quy cách & bản vẽ   Tệp đính kèm 3   Nhật ký                                     ③ Tabs
 ────────────────────────────────────────────────────────────────────────────────
  (nội dung tab — tải khi mở)
```

| Vùng | Quy tắc |
|---|---|
| ① Tầng 1 | `←` về danh sách (giữ nguyên bộ lọc nhờ URL) · ảnh 64px (không ảnh → khung chữ viết tắt) · tên · tối đa 2 badge (trạng thái, mã) · dòng phụ: 2–3 thông tin nhận diện + "Cập nhật … bởi …" · **1 nút chính "Chỉnh sửa"** · `⋯` gom thao tác phụ (nhân bản, khóa/mở, đổi mật khẩu, xóa — xóa ở cuối, màu đỏ, sau divider). |
| ② Tầng 2 | Lưới thuộc tính 4 cột (2 tablet, 1 mobile), nhãn chữ phụ 12px trên – giá trị 14px dưới. **Tối đa 8 trường**; phần còn lại sau "Xem thêm". Trường rỗng hiện "—". Không lặp thông tin đã có ở tầng 1. |
| ③ Tabs | Tab nghiệp vụ của module trước, 2 tab chuẩn cuối: "Tệp đính kèm" (kèm số lượng), "Nhật ký". Tab đang mở lưu `?tab=` trên URL. Mỗi tab tự tải dữ liệu khi được mở. |

### 2.2 Tab chuẩn
- **Tệp đính kèm:** dùng `DetailAttachmentsTab`; không có quyền UPDATE → chỉ xem / tải.
- **Nhật ký** (`EntityAuditTab` dùng chung, cần `AUDIT_LOGS_READ`): dòng thời gian gọn nhóm theo ngày; mỗi mục: ai · làm gì · lúc nào · các trường thay đổi `cũ → mới` (tối đa 3, "xem thêm"); phân trang "Tải thêm".

### 2.3 Trạng thái
- Đang tải: Skeleton đúng bố cục Hero + tab.
- Không tìm thấy / đã bị xóa: trang 404 gọn "Bản ghi không tồn tại hoặc đã bị xóa" + nút về danh sách.
- Không có quyền: 403 (RouteGuard / API).

### 2.4 Mobile
- Tầng 1 xếp dọc: ảnh + tên; nút "Chỉnh sửa" và `⋯` xuống dòng dưới, full width.
- Tabs cuộn ngang.

### 2.5 Khai báo trong module

```tsx
<DetailPage
  moduleCode="MATERIAL"
  entityType="Material"
  query={useMaterialDetail(id)}
  hero={(m) => ({
    image: m.image_url,
    title: m.material_name,
    badges: [statusBadge(m.is_active), codeBadge(m.material_code)],
    subtitle: [m.category_name, m.unit_code],
    fields: [
      { label: "Nhóm", value: m.category_name },
      { label: "Quy cách", value: formatSpec(m) },
      // …
    ],
  })}
  onEdit={can(MATERIAL.UPDATE) ? openEdit : undefined}
  moreActions={[{ key: "delete", label: "Xóa", danger: true, onClick: can(MATERIAL.DELETE) ? remove : undefined }]}
  tabs={[{ key: "specs", label: "Quy cách & bản vẽ", children: <MaterialSpecsTab id={id} /> }]}
/>
// Tab "Tệp đính kèm", "Nhật ký", breadcrumb, 404, Skeleton do DetailPage tự lo.
```

---

## 3. Badge trạng thái & màu sắc

**Hiện trạng:** 2 component trùng việc (`StatusTag` và `StatusBadge` trong `lib/theme/statusBadges.tsx`); bảng màu viết cứng hex cho **từng trạng thái** (active, approved, in_stock… mỗi cái một bộ màu gần giống nhau) → khó giữ đồng bộ, chế độ tối phải tự pha.

**Thiết kế mới: màu theo "sắc thái" (tone), không theo từng trạng thái**

| Tone | Ý nghĩa | Ví dụ trạng thái | Biến màu |
|---|---|---|---|
| `success` | Tốt / đã xong / đang dùng | Hoạt động, Hoàn thành, Đã duyệt, Còn hàng | `--c-success` |
| `info` | Đang diễn ra | Đang xử lý, Đang sản xuất, Đang xem xét | `--c-info` |
| `warning` | Cần chú ý / chờ người xử lý | Chờ duyệt, Sắp hết hàng, Quá hạn nhẹ | `--c-warning` |
| `error` | Thất bại / bị từ chối | Lỗi, Từ chối, Hết hàng | `--c-error` |
| `neutral` | Không hoạt động / chưa bắt đầu / đã kết thúc | Ngưng hoạt động, Nháp, Đã hủy, Lưu trữ | `--c-text-secondary` |
| `accent` | Đặc biệt, dùng rất hạn chế | Phiên bản, Mẫu độc quyền | `--c-purple` |

**Hình dáng (1 kiểu duy nhất cho mọi bảng và trang chi tiết)**
```
 ● Hoạt động        ← chấm 6px màu tone + chữ 12px đậm 500, nền tone nhạt (color-mix 12%), không viền,
                       bo 6px, cao 22px, padding 0 8px
```
- Chữ luôn đi kèm màu (không dùng màu làm tín hiệu duy nhất — người mù màu vẫn đọc được).
- "Ngưng hoạt động" dùng **xám**, không dùng đỏ — đỏ chỉ cho lỗi / từ chối thật sự.
- Mã, phiên bản: **không** dùng badge màu; hiển thị chữ monospace xám (`GO-00012`), để badge trạng thái nổi bật.
- Tối đa 2 badge cạnh nhau ở một vị trí.
- Chế độ tối: nền và chữ tự pha từ biến tone bằng `color-mix`, không khai báo hex riêng.

**Khai báo trong module**
```ts
// modules/<module>/constants.ts
export const WORK_ORDER_STATUS = defineStatusMap({
  DRAFT:       { label: "Nháp",           tone: "neutral" },
  PENDING:     { label: "Chờ duyệt",      tone: "warning" },
  IN_PROGRESS: { label: "Đang sản xuất",  tone: "info" },
  DONE:        { label: "Hoàn thành",     tone: "success" },
  CANCELLED:   { label: "Đã hủy",         tone: "neutral" },
});

<StatusBadge map={WORK_ORDER_STATUS} value={row.status} />
// Cùng map này sinh luôn options cho bộ lọc cột `select` / `multiSelect`.
```
- `is_active` dùng map chung có sẵn: `ACTIVE_STATUS` (Hoạt động / Ngưng hoạt động).
- Gộp `StatusTag` + `StatusBadge` cũ thành 1 `StatusBadge`; xóa bảng màu hex theo từng trạng thái.

## 4. Xem nhanh (Quick view)
- Mở từ `⋯` → "Xem nhanh" trên dòng: Drawer phải 480px, dùng lại `hero.fields` của trang chi tiết + nút "Mở trang chi tiết".
- Dữ liệu tải khi Drawer mở; Esc để đóng; không mất bộ lọc danh sách.

## 5. Không làm
- Thùng rác / khôi phục bản ghi đã xóa (đã bỏ khỏi template).
- Sắp xếp nhiều cột cùng lúc, lưu "bộ lọc đã lưu" theo user, sửa trực tiếp trên ô bảng, chuyển bản ghi trước / sau trên trang chi tiết.
