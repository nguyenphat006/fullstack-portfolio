---
name: API & Prisma Guidelines
description: Quy chuẩn kiến trúc và nguyên tắc code RESTful API kết hợp Prisma ORM.
---

# Quy Chuẩn Phát Triển API (Express.js & Prisma)

Tài liệu này định nghĩa các quy tắc bắt buộc khi tạo mới hoặc chỉnh sửa API trong dự án Fullstack Portfolio.

## 1. Nguyên Tắc Trả Về (Response Formatting)
**Tuyệt đối không dùng `res.send` hay `res.json` trực tiếp.**
Bắt buộc sử dụng hàm `sendResponse` từ `src/utils/response.ts` để đảm bảo format đồng nhất trên toàn bộ hệ thống:

```typescript
// ✅ ĐÚNG
import { sendResponse } from "../utils/response";
sendResponse(res, 200, true, "Lấy dữ liệu thành công", data);

// ❌ SAI
res.status(200).json({ data });
```

## 2. Nguyên Tắc Bắt Lỗi (Error Handling)
**Tuyệt đối không dùng `try...catch` trong các Controllers.**
Để tránh lặp code và dọn dẹp controller, bắt buộc phải bọc function bằng `catchAsync`. 

```typescript
// ✅ ĐÚNG
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getItems = catchAsync(async (req, res) => {
  const item = await db.find();
  if (!item) throw new AppError("Không tìm thấy item", 404);
  sendResponse(res, 200, true, "Success", item);
});

// ❌ SAI
export const getItems = async (req, res) => {
  try {
     // ... logic
  } catch(e) {
     res.status(500).json({ error: e });
  }
}
```

## 3. Nguyên Tắc Thao Tác Prisma (Database Rules)

### A. Quy tắc Xóa Mềm (Soft Deletion)
Tất cả các bảng trong database đều có field `isDeleted`. Chúng ta **tuyệt đối không dùng `prisma.model.delete()`**.
- Khi lấy dữ liệu: **Luôn luôn** thêm điều kiện `isDeleted: false` vào mệnh đề `where`.
- Khi xóa dữ liệu: Dùng `prisma.model.update()` và set `isDeleted: true`.

```typescript
// ✅ ĐÚNG
const data = await prisma.project.findMany({
  where: { isDeleted: false }
});

// ❌ SAI (Sẽ lấy cả rác đã bị xoá)
const data = await prisma.project.findMany();
```

### B. Audit Fields (Dấu vết dữ liệu)
Bất cứ khi nào khởi tạo một Bảng (Model) mới trong `schema.prisma`, bắt buộc phải có nhóm field hệ thống:
```prisma
  // Audit & Status fields
  description String?  @db.Text
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  createdBy   String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
```

## 4. Tài liệu hoá (Swagger Documentation)
Mọi endpoint đều phải được mô tả bằng cú pháp JSDoc `@openapi` ngay trên đầu khai báo Router. Code đến đâu, viết Docs đến đó.

```typescript
/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Lấy chi tiết dự án
 */
router.get("/:id", getProjectById);
```

## 5. Xác thực Dữ Liệu (Validation)
- Yêu cầu dùng **Zod** để định nghĩa schemas cho `req.body` và `req.query`.
- Đẩy Zod schema qua một Validation Middleware (chưa triển khai - dự kiến Phase tiếp theo) để catch lỗi tập trung về `globalErrorHandler`. Lỗi Zod sẽ được middleware bắt và phân tích cụ thể field nào sai.
