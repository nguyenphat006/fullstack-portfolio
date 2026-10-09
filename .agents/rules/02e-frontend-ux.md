---
description: "Quy chuẩn UI/UX gọn gàng: nội dung theo lớp, layout có hệ thống, chỉ tải dữ liệu đang hiển thị"
globs: ["client/**/*"]
always_apply: true
---

# 🧭 QUY CHUẨN UI/UX GỌN GÀNG & TẢI DỮ LIỆU TIẾT KIỆM

Mục tiêu: mỗi màn hình **gọn, rõ, đúng việc** — thấy ngay thứ cần để ra quyết định, chi tiết mở khi cần. Không nhồi nội dung, không gọi API thừa.
Quy chuẩn riêng từng loại trang: `02c` (danh sách), `02d` (chi tiết), `02b` (form).

## 1. Nội dung — ít mà đủ
- Mỗi màn hình **1 mục tiêu chính**; khối không phục vụ việc chính → bỏ hoặc đưa vào lớp sau.
- **Hiển thị theo lớp:** thông tin chính ở màn hình → chi tiết trong tab / Sheet / Popover / Tooltip → hiếm dùng trong dropdown `...`.
- Không thêm khối trang trí (MetricCard, banner chào mừng, Alert hướng dẫn dài, số liệu không ai dùng). Hướng dẫn cần thiết → 1 dòng chữ phụ hoặc Tooltip `?`.
- Không lặp thông tin giữa header, thân và tab.
- Chữ ngắn, động từ rõ; viết hoa chữ đầu câu, không VIẾT HOA TOÀN BỘ, không emoji trong UI.
- Text dài → `ellipsis` + Tooltip; số liệu có đơn vị, định dạng qua `useNumberFormat()`.
- Đủ 3 trạng thái: đang tải (`Skeleton` đúng kích thước), rỗng (`EmptyState` + hành động kế tiếp), lỗi (thông điệp + "Thử lại").

## 2. Layout — gọn và có hệ thống
- Khoảng cách theo thang **4 / 8 / 12 / 16 / 24 px**; giữa các khối = 16.
- Lưới Tailwind `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`; form dùng `FormSection`; không cố định `width` khối nội dung.
- Không lồng Card trong Card / viền trong viền — phân vùng bằng nền `var(--c-bg-subtle)` hoặc Divider.
- Mỗi vùng tối đa **1 nút primary**; ≥ 3 thao tác phụ → dropdown `...`.
- Gradient / shadow đậm chỉ cho nút chính và khối thương hiệu theo mẫu; còn lại phẳng, dùng token `var(--c-*)`.
- Cỡ chữ: nội dung 14, phụ 12–13, tiêu đề khối 16; tối đa 2 độ đậm trong một khối. Chữ căn trái, số căn phải.
- Responsive: kiểm tra 375px — không cuộn ngang cả trang, thanh thao tác xuống dòng, ẩn cột phụ trên mobile.

## 3. Tải dữ liệu — chỉ lấy thứ đang hiển thị
- Tab: query nằm trong component của tab (tab chưa mở → chưa gọi API).
- Dialog / Sheet / Popover: `useQuery({ enabled: open })`.
- Danh sách phân trang server-side (`page_size` 10–20); không tải hết rồi lọc client (trừ danh mục ≤ 100 bản ghi).
- Số liệu tổng hợp / dashboard: 1 endpoint gộp, không gọi nhiều API danh sách chỉ để đếm.
- Select thực thể: remote search + debounce.
- Dùng lại cache: user / quyền / menu qua `useAuthStore`, `usePermission`, `useNavigation`; `staleTime` ≥ 5 phút cho dữ liệu ít đổi.
- Polling chỉ khi cần (tác vụ nền, thông báo), chu kỳ ≥ 15 giây, dừng khi tab ẩn (`refetchIntervalInBackground: false`).
- API danh sách chỉ trả trường hiển thị; trường nặng chỉ ở API chi tiết. Không gọi API chi tiết cho từng dòng.
- Ảnh: thumbnail trong danh sách, ảnh gốc khi xem trước; `loading="lazy"`.

## 4. Tương tác thông minh
- Nguy hiểm → xác nhận (`useConfirm` / `DeleteConfirm`); an toàn → làm ngay + `toast.success` ngắn.
- Nút đang gửi → `loading`; sau khi lưu giữ nguyên trang / bộ lọc / vị trí cuộn.
- Bộ lọc, tab đang chọn phản ánh lên URL khi hợp lý.
- Phím tắt cho thao tác lặp lại (Enter, Esc, Ctrl+K).
- Không có quyền → ẩn nút / khối (xem `02a` mục 5b); chỉ disable khi cần giải thích (kèm Tooltip).

## Checklist trước khi báo xong màn hình
- [ ] Bỏ được khối nào mà màn hình vẫn đủ dùng? Có → bỏ.
- [ ] Tab Network chỉ có request cho dữ liệu đang hiển thị (không trùng, không tải tab ẩn).
- [ ] Đủ trạng thái tải / rỗng / lỗi; đúng ở sáng + tối; không vỡ ở 375px.
- [ ] Khoảng cách theo thang 4/8, không Card lồng Card, tối đa 1 nút primary mỗi vùng.
