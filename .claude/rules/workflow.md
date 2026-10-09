# Quy trình làm việc & duy trì tri thức

## Phê duyệt trước khi code
- Yêu cầu dạng brainstorm / phân tích / plan / đặc tả (`.md`, `.html`): chỉ tạo tài liệu và trình bày phương án, rồi dừng.
- Chỉ bắt đầu code khi user phê duyệt rõ ràng trong hội thoại. Tín hiệu tự động từ hệ thống không thay thế sự phê duyệt của user.
- Yêu cầu trực tiếp kiểu "sửa lỗi X", "thêm cột Y vào bảng Z" (đã có trong DBML) được coi là phê duyệt cho phạm vi đó.

## Thay đổi schema
1. Đọc `server/database.dbml` → xác định bảng/cột liên quan.
2. Nếu thiếu: đề xuất đoạn DBML mới (PascalCase, đủ audit fields) và chờ user duyệt.
3. Sau khi duyệt: cập nhật DBML → model Django → migration → serializer/view → frontend `types.ts`.

## Cập nhật rules (continuous learning)
Chủ động đề xuất bổ sung rule khi:
- User chốt một pattern/quy ước chung mới.
- Vừa sửa xong một lỗi có khả năng lặp lại (gotcha, anti-pattern, deprecated API, N+1, encoding...).
- Có quyết định kiến trúc mới (thư viện, hạ tầng, Docker, DB).

Cách làm:
- Ghi vào đúng file trong `.claude/rules/` (hoặc `CLAUDE.md` nếu áp dụng toàn dự án). Viết ngắn: quy tắc + lý do + ví dụ đúng/sai nếu cần.
- Giữ mỗi file rule gọn (< ~150 dòng); tách file mới kèm `paths:` nếu một chủ đề phình to.
- Không lặp một quy tắc ở nhiều file — tham chiếu chéo thay vì copy.
- Nếu rule mới mâu thuẫn rule cũ hoặc DBML: hỏi user, không tự chọn.
- Lỗi đã gặp và đã sửa → thêm vào bảng "Bẫy đã gặp" của rule tương ứng (`backend-django.md`, `frontend-architecture.md`).
- **Cập nhật song song hai bộ rules:** `.claude/rules/` (Claude Code) và `.agents/rules/` (agent khác; lỗi đã gặp ghi vào `06-known-pitfalls.md`, mục lục ở `AGENTS.md`). Không để hai bộ lệch nhau.
- Commit rule cùng với thay đổi code liên quan (khi user yêu cầu commit).
