---
description: "Quy tắc tự động cập nhật Rules & Đúc kết Kinh nghiệm (Continuous Learning & Auto-Rule Sync)"
globs: ["**/*"]
always_apply: true
---

# 🧠 QUY TẮC TỰ ĐỘNG ĐÚC KẾT & CẬP NHẬT RULES (CONTINUOUS LEARNING)

Quy định này bắt buộc AI Agent phải liên tục cập nhật và làm giàu bộ tri thức của dự án trong suốt quá trình phát triển.

---

## 1. Các trường hợp Kích hoạt Cập nhật Rules Tự động:
AI Agent **bắt buộc phải chủ động cập nhật Rules** (`.agents/rules/` hoặc `AGENTS.md`) ngay khi xuất hiện các tình huống sau:
1. **Khi USER đưa ra quy chuẩn / yêu cầu chung mới:**
   - Ví dụ: Thống nhất một pattern UI mới, quy định cấu trúc thư mục, quy ước đặt tên biến/hàm, hoặc luồng nghiệp vụ mới.
2. **Khi xử lý xong một lỗi kỹ thuật / bẫy mã nguồn (Gotchas / Anti-patterns):**
   - Bất kỳ lỗi nào đã xảy ra và được khắc phục (ví dụ: Lỗi encoding tiếng Việt trên Windows console, lỗi giật UI khi đọc localStorage, lỗi deprecated props của thư viện, lỗi N+1 query...).
   - Agent phải đúc kết nguyên nhân và ghi thành quy tắc cấm tái diễn trong bộ Rules tương ứng.
3. **Khi có quyết định kiến trúc mới:**
   - Thay đổi hoặc bổ sung công nghệ (ví dụ: Tích hợp thư viện mới, thay đổi nhà cung cấp Cloud DB, cấu hình Docker mới).

---

## 2. Quy trình Thực hiện của Agent:
- **Bước 1:** Xác định rõ nhóm kiến trúc bị ảnh hưởng (`01-general`, `02-frontend`, `03-backend`). Lỗi đã gặp và đã sửa → thêm 1 dòng vào `06-known-pitfalls.md` (Lỗi đã xảy ra | Quy tắc phòng tránh).
- **Bước 1b:** Cập nhật song song bộ rules của Claude Code tại `.claude/rules/` (cùng nội dung, đúng file theo phạm vi) để hai bộ không lệch nhau.
- **Bước 2:** Bổ sung điều khoản ngắn gọn, súc tích và có ví dụ minh họa vào file rule tương ứng.
- **Bước 3:** Cập nhật mục lục tại [AGENTS.md](AGENTS.md).
- **Bước 4:** Commit thay đổi vào Git để toàn bộ team và các phiên làm việc sau đều kế thừa tri thức này.
