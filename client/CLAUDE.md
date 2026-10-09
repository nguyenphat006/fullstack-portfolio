@AGENTS.md

# Client — Next.js 16 + Tailwind v4 + shadcn/ui

Quy chuẩn chi tiết nằm ở `../.claude/rules/frontend-*.md` (tự nạp khi làm việc với `client/**`).

## Lệnh (chạy trong `client/`)
```bash
npm run dev                          # http://localhost:3000
npx tsc --noEmit                     # kiểu
npm run lint -- --max-warnings=0     # ESLint (CI chặn cả cảnh báo)
npm test                             # Vitest (unit / component) — quy chuẩn ../.claude/rules/testing.md
npm run build                        # phải 0 errors, 0 warnings trước khi báo xong
npx shadcn@latest add <component>    # thêm primitive vào src/components/ui
```
Env: `.env.local` (mẫu `.env.example`) — `NEXT_PUBLIC_API_URL` trỏ tới `http://localhost:8000/api/v1`.

## Bản đồ nhanh
- `src/app/` — route mỏng; nhóm `(auth)` và `(dashboard)`. `globals.css`: token màu `--c-*` (sáng/tối) + token shadcn trỏ về chúng.
- `src/modules/<feature>/` — toàn bộ logic màn hình. Mẫu: `master-data/units` (danh sách), `master-data/materials` (có chi tiết).
- `src/components/ui/` — primitive shadcn (sinh bằng CLI, hạn chế sửa). `controls/` — Combobox, TreeSelect, DateRangePicker, NumberInput, FileDropzone.
- `src/components/form/` — FormDialog + các trường react-hook-form. `feedback/` — `useConfirm`, Spinner.
- `src/components/list/`, `detail/` — khung trang danh sách / chi tiết. `common/` — PageHeader, StatusBadge, EmptyState, DeleteConfirm, ExportConfigModal, ExcelImportModal, AttachmentManager...
- `src/lib/api/` — `axiosClient` (JWT + refresh), `errorUtils.extractErrorMessage`, `formErrors.applyServerErrors`. `src/lib/utils.ts` — `cn`.
- `src/lib/formatters/`, `src/providers/NumberFormatProvider.tsx` — định dạng số.
- `src/hooks/` — `usePermission`, `useModuleHeader`, `useBreadcrumbTitle`, `useNavigation`, `useMounted`.
- `src/stores/` — Zustand (`useAuthStore`, `useBreadcrumbStore`, `useThemeStore`).
- `src/constants/permissions.ts` — mã quyền, phải khớp `seed_core` ở backend.
