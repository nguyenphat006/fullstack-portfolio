---
paths:
  - "client/src/**"
---

# Frontend — UI/UX gọn gàng & tải dữ liệu tiết kiệm

Mục tiêu: mỗi màn hình **gọn, rõ, đúng việc**. Người dùng thấy ngay thứ cần để ra quyết định; chi tiết mở khi cần. Không nhồi nội dung, không gọi API thừa.
Quy chuẩn riêng từng loại trang: `frontend-tables.md` (danh sách), `frontend-detail-views.md` (chi tiết), `frontend-forms.md` (form).

## 1. Nội dung — ít mà đủ
- Mỗi màn hình **1 mục tiêu chính**. Trước khi thêm một khối, hỏi: người dùng có cần nó để làm việc chính không? Không → bỏ hoặc đưa vào lớp sau.
- **Hiển thị theo lớp (progressive disclosure):** thông tin chính ở màn hình → chi tiết trong tab / Sheet / Popover / Tooltip → hiếm dùng trong dropdown `...`.
- Không thêm khối trang trí: MetricCard, banner chào mừng, Alert hướng dẫn dài, icon minh họa, số liệu không ai dùng. Hướng dẫn cần thiết → 1 dòng chữ phụ hoặc Tooltip `?`.
- Không lặp thông tin giữa các vùng (header ↔ thân ↔ tab).
- Chữ ngắn, động từ rõ ("Thêm vai trò", không "Tạo Mới Vai Trò Hệ Thống"). Viết hoa chữ đầu câu, không VIẾT HOA TOÀN BỘ, không emoji trong UI.
- Text dài → `ellipsis` + Tooltip; số liệu luôn có đơn vị và qua `useNumberFormat()`.
- Mọi khối dữ liệu có đủ 3 trạng thái: đang tải (`Skeleton`, giữ đúng kích thước khối), rỗng (`EmptyState` kèm hành động kế tiếp nếu có quyền), lỗi (thông điệp + "Thử lại").

## 2. Layout — gọn và có hệ thống
- Khoảng cách theo thang **4 / 8 / 12 / 16 / 24 px**; khoảng cách giữa các khối trong trang = 16. Không dùng số lẻ (13px, 18px, 22px…).
- Lưới: Tailwind `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`…; form dùng `FormSection`; không đặt `width` cố định cho khối nội dung.
- Không lồng Card trong Card, không viền trong viền — phân vùng bằng nền (`var(--c-bg-subtle)`) hoặc Divider.
- Mỗi vùng tối đa **1 nút primary**; nút phụ dạng default/text; từ 3 thao tác phụ trở lên → gom vào dropdown `...`.
- Hiệu ứng nặng (gradient, shadow đậm) chỉ dành cho nút chính / khối thương hiệu theo mẫu có sẵn; phần còn lại phẳng, dùng token `var(--c-*)`.
- Cỡ chữ: nội dung 14, phụ 12–13, tiêu đề khối 16, tiêu đề trang theo `PageHeader`. Tối đa 2 độ đậm trong một khối.
- Căn lề: chữ trái, số phải (bảng), trạng thái giữa.
- Responsive: kiểm tra ở 375px — không cuộn ngang cả trang (bảng cuộn ngang trong `.dt-scroll`), thanh thao tác tự xuống dòng, cột phụ ẩn trên mobile.

## 3. Tải dữ liệu — chỉ lấy thứ đang hiển thị
- **Tab:** query đặt trong component của tab, không gọi ở View cha → tab chưa mở thì chưa gọi API (Radix `TabsContent` chỉ render tab đang mở).
- **Dialog / Sheet / Popover:** `useQuery({ enabled: open })`.
- **Danh sách:** phân trang server-side (`page`, `page_size` 10–20). Không tải toàn bộ rồi lọc ở client; ngoại lệ danh mục nhỏ ≤ 100 bản ghi (`page_size: 100`).
- **Số liệu tổng hợp / dashboard:** 1 endpoint gộp (vd. `/statistics/`, `/dashboard/overview/`), không gọi nhiều API danh sách chỉ để đếm `count`.
- **Select thực thể:** remote search + debounce (xem `frontend-tables.md`), không tải trước toàn bộ.
- **Dùng lại cache:** thông tin người dùng / quyền / menu lấy từ hook có sẵn (`useAuthStore`, `usePermission`, `useNavigation`), không gọi lại `/auth/me/`, `/navigation/`. Đặt `staleTime` cho dữ liệu ít đổi (danh mục, cấu hình ≥ 5 phút).
- **Polling:** chỉ khi thật cần (tác vụ nền, thông báo); chu kỳ ≥ 15 giây, tự dừng khi tab trình duyệt ẩn (`refetchIntervalInBackground: false`) và khi không còn việc cần theo dõi.
- **Payload:** API danh sách chỉ trả trường bảng hiển thị; trường nặng (mô tả dài, lịch sử, quan hệ lồng) chỉ ở API chi tiết. Cần thêm trường → sửa serializer, không gọi API chi tiết cho từng dòng.
- Ảnh: thumbnail trong bảng / danh sách, ảnh gốc chỉ khi xem trước; `loading="lazy"`.

## 4. Tương tác thông minh
- Hành động nguy hiểm → xác nhận (`useConfirm` / `DeleteConfirm`); hành động an toàn → làm ngay + `toast.success` ngắn.
- Nút đang gửi → `loading`, chặn bấm lặp. Sau khi lưu: đóng modal, giữ nguyên trang / bộ lọc / vị trí cuộn.
- Bộ lọc và tab đang chọn phản ánh lên URL khi hợp lý (chia sẻ link, F5 không mất trạng thái).
- Phím tắt cho thao tác lặp lại nhiều (Enter gửi form, Esc đóng, Ctrl+K tìm màn hình).
- Không hiện nút / khối người dùng không có quyền (`security-rbac.md`) — ẩn thay vì disable, trừ khi cần giải thích lý do (kèm Tooltip).

## Checklist trước khi báo xong màn hình
- [ ] Xóa được khối nào mà màn hình vẫn đủ dùng không? Có → xóa.
- [ ] Mở màn hình: số request trong tab Network chỉ gồm dữ liệu đang hiển thị (không request trùng, không tải tab ẩn).
- [ ] Đủ trạng thái tải / rỗng / lỗi; đúng ở chế độ sáng + tối; không vỡ ở 375px.
- [ ] Khoảng cách theo thang 4/8, không Card lồng Card, tối đa 1 nút primary mỗi vùng.
