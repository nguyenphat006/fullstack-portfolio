---
name: Database Design & Prisma CRUD Standards
description: Bộ quy chuẩn thiết kế Database và thực thi các lệnh CRUD bằng Prisma ORM.
---

# Quy Chuẩn Thiết Kế Database & Prisma CRUD

Tài liệu này định nghĩa các nguyên tắc cốt lõi khi thao tác với cơ sở dữ liệu và Prisma trong dự án.

## 1. Quy Chuẩn Đặt Tên (Naming Conventions)

### A. Tên Bảng / Model (Table/Model Names)
- **Prisma Model**: Đặt tên theo dạng `PascalCase` và số ít (Singular). Ví dụ: `Project`, `User`, `Blog`.
- (PostgreSQL dưới nền sẽ tự động map theo ý Prisma, nhưng chuẩn trong code là số ít).

### B. Tên Cột / Trường (Column/Field Names)
- Sử dụng `camelCase` cho toàn bộ các field. 
- Không dùng `snake_case` (vd: `is_active` ❌ -> `isActive` ✅).
- **Boolean fields**: Bắt buộc bắt đầu bằng chữ `is`, `has`, `can` (vd: `isDeleted`, `hasAccess`).
- **Date fields**: Bắt buộc kết thúc bằng `At` hoặc `Date` (vd: `createdAt`, `updatedAt`, `publishDate`).

## 2. Tiêu Chuẩn Cho Mọi Bảng (Base Fields)
Bất kỳ Model nào được tạo ra cũng **bắt buộc** phải có khối trường (Audit & Soft Delete) sau:

```prisma
  // Khóa chính
  id          String   @id @default(uuid())

  // Các trường Audit & Trạng thái
  description String?  @db.Text
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  createdBy   String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
```
*Ghi chú: Khóa chính ưu tiên dùng UUID (chuỗi) để tăng tính bảo mật, tránh bị lộ lượng dữ liệu qua số ID tự tăng (Auto Increment).*

## 3. Quy Chuẩn Prisma CRUD (Database Operations)

### A. READ (Lấy Dữ Liệu)
- **Luôn chặn Dữ liệu đã Xóa Mềm**: Không bao giờ được phép quét các record có `isDeleted: true` ra API đại trà.
- **Phân trang (Pagination)**: Với các danh sách, bắt buộc phải dùng `take` (limit) và `skip` (offset) để tránh sập server khi database phình to.
- **Sắp xếp mặc định**: Các danh sách luôn mặc định order theo `createdAt: "desc"` (Mới nhất lên đầu).

```typescript
// ✅ ĐÚNG chuẩn Lấy danh sách
const users = await prisma.user.findMany({
  where: { isDeleted: false },
  orderBy: { createdAt: "desc" },
  take: 20, // Limit
  skip: 0   // Offset
});
```

### B. CREATE (Thêm Dữ Liệu)
- Không cho phép client gửi `id` từ body. UUID phải do Prisma tự sinh ra `@default(uuid())`.
- Những trường không bắt buộc (Optional) phải cẩn thận xử lý giá trị `undefined` hoặc fallback về Null.

### C. UPDATE (Sửa Dữ Liệu)
- **Kiểm tra tồn tại**: Trước khi Update, phải chắc chắn Record đó tồn tại và **chưa bị xóa mềm**. Nếu cố Update record không tồn tại, Prisma sẽ ném ra lỗi `P2025`. (Hệ thống đã có Error Middleware hứng lỗi này, nhưng khuyến khích check cẩn thận logic).

```typescript
// ✅ ĐÚNG: Trực tiếp update kèm điều kiện an toàn
const updated = await prisma.project.update({
  where: { id: req.params.id }, // Error Middleware sẽ bắt lỗi nếu ID sai
  data: { ...req.body, updatedBy: "user-id-here" }
});
```

### D. DELETE (Xóa Dữ Liệu)
- **Nghiêm cấm** dùng `prisma.model.delete()`.
- Xóa bản chất là `Update` trường `isDeleted` thành `true`.

```typescript
// ❌ SAI HOÀN TOÀN (Tuyệt đối không dùng delete)
await prisma.project.delete({ where: { id: "123" } });

// ✅ ĐÚNG CHUẨN: Xóa Mềm
await prisma.project.update({
  where: { id: "123" },
  data: { isDeleted: true, updatedBy: "user-id" }
});
```

## 4. Quản lý Ràng buộc & Tối ưu (Relations & Indexing)
- **Khóa Ngoại (Relations)**: Khi liên kết 2 bảng (ví dụ `User` 1-N `Post`), bắt buộc field trỏ ID phải có hậu tố `Id` (vd: `authorId`). Đừng lạm dụng cascading delete (`onDelete: Cascade`) mà hãy tự kiểm soát qua Soft Delete.
- **Đánh Index**: Những trường hay dùng để tìm kiếm (search), lọc (filter) phải được gắn thẻ `@@index`.

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  posts     Post[]

  @@index([email]) // Tăng tốc khi user đăng nhập bằng email
}

model Post {
  id        String   @id @default(uuid())
  title     String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
}
```
