# Tìm kiếm toàn cục (Global Search)

Ô **Tìm kiếm** cố định ở đầu sidebar (ngay dưới tên dự án) và phím tắt **Ctrl K / ⌘K** mở cùng một hộp tìm kiếm.
Từ một ô duy nhất, người dùng tìm được:

| Loại | Nguồn | Phạm vi theo quyền |
|---|---|---|
| Màn hình | Cây menu `/modules/navigation/` (tìm ở client, không dấu, theo tên / nhóm / **mã phân hệ**, vd. `MATERIAL`) | Chỉ màn hình có `<MODULE>_VIEW` (menu đã lọc sẵn) |
| Bản ghi | `GET /api/v1/search/?q=` — tìm theo **mã** / tên trên mọi phân hệ đã đăng ký | Chỉ phân hệ có `<MODULE>_READ` **và** đang bật (`ModuleRegistries.is_active`) |
| Thao tác nhanh | Hồ sơ, đổi giao diện, đổi ngôn ngữ, đổi mật khẩu, đăng xuất | Mọi người dùng |

Chưa gõ gì: hiện **Tìm gần đây** (5 từ khóa), **Mở gần đây** (6 màn hình / bản ghi) và thao tác nhanh.

## 1. Luồng xử lý

```
Gõ từ khóa ──► màn hình: searchRoutes() trên menu (ngay lập tức, client)
          └──► bản ghi: debounce 250ms, ≥ 2 ký tự ──► GET /search/?q=&limit=5
                                                      │
                     backend: collect_search_providers() (gom search.py của từng app)
                              → bỏ nguồn thiếu quyền <MODULE>_READ / phân hệ tắt
                              → mỗi nguồn: lọc icontains (mã, tên, trường thêm), xếp hạng, cắt `limit`
                              → nhóm theo phân hệ (tên phân hệ theo ngôn ngữ của request)
Chọn kết quả ──► lưu lịch sử (từ khóa + mục) theo người dùng ──► router.push(url)
```

Xếp hạng trong một phân hệ: **trùng mã** > mã bắt đầu bằng từ khóa > tên bắt đầu bằng từ khóa > chứa từ khóa, rồi theo tên.

## 2. Backend — thêm nguồn tìm cho phân hệ mới

Mỗi app tự khai báo `apps/<app>/search.py` (cùng kiểu `rbac.py`); **không sửa lõi**. `startmodule` sinh sẵn file này.

```python
# apps/master_data/search.py
from apps.core.search_registry import SearchProvider
from .models import Material

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='MATERIAL',                 # quyền cần: MATERIAL_READ (đổi bằng permission=...)
        model=Material,
        code_field='material_code',             # dùng để xếp hạng "trùng mã"
        title_field='material_name',
        extra_fields=('metal_spec__mold_code',),  # tìm thêm, không xếp hạng
        subtitle=lambda m: m.category.name if m.category_id else None,
        image_field='image_url',
        select_related=('category',),           # tránh N+1 khi đọc subtitle
        url='/master-data/materials/{id}',      # có trang chi tiết
    ),
]
```

- Phân hệ **chưa có trang chi tiết** → mở danh sách đã lọc: `url='/master-data/units?q={code}'` (`q` là tham số tìm kiếm của `useListState`).
- Mặc định dùng `model._default_manager` (đã bỏ bản ghi xóa mềm). Model kế thừa `AbstractUser` (manager không lọc xóa mềm) → truyền `queryset=lambda: Model.objects.filter(deleted_at__isnull=True)`.
- Chỉ khai báo trường **an toàn để hiển thị** cho người có quyền `_READ` (không đưa giá, mật khẩu, dữ liệu nhạy cảm vào `subtitle`).
- Endpoint chỉ cần đăng nhập; RBAC áp dụng **theo từng nguồn** trong `global_search()` — đây là lớp bảo mật thật, frontend không lọc lại.

## 3. Frontend

| File | Vai trò |
|---|---|
| `components/layouts/AppSidebar.tsx` | Ô tìm cố định dưới logo (`.sider-search`), sidebar thu gọn chỉ còn icon + tooltip |
| `components/layouts/command-palette/CommandPalette.tsx` | Hộp tìm (cmdk): nhóm Tìm gần đây · Mở gần đây · Màn hình · Bản ghi theo phân hệ · Thao tác |
| `command-palette/searchNavigation.ts` | Làm phẳng menu + tìm màn hình không dấu, có mã phân hệ trong chuỗi tìm |
| `command-palette/useGlobalSearch.ts` | Debounce 250ms, ≥ 2 ký tự (`SEARCH_MIN_LENGTH` khớp backend), cache 30 giây theo từ khóa |
| `command-palette/recentSearch.ts` | Lịch sử theo người dùng (`localStorage` `app_recent_search_<userId>`), kho ngoài React (`useSyncExternalStore`) để sidebar / layout / hộp tìm dùng chung |
| `services/search.service.ts` | `searchService.global(q, limit)`; kiểu `SearchGroup` / `SearchResult` sinh từ OpenAPI |

Layout tự ghi màn hình vừa mở vào "Mở gần đây"; chọn bản ghi từ kết quả cũng được ghi.

## 4. Best practices đã áp dụng

- **Một ô tìm duy nhất, vị trí cố định** (đầu sidebar, không cuộn theo menu) + phím tắt quen thuộc Ctrl K.
- **Tìm theo mã là chính**: mã nghiệp vụ (NVL, ĐVT, tài khoản…) được xếp hạng cao nhất; mã phân hệ tìm được màn hình.
- **RBAC ở server, theo từng nguồn**, kèm trạng thái bật / tắt phân hệ; không lộ việc bản ghi tồn tại với người không có quyền xem.
- **Tải tối thiểu**: màn hình tìm ở client (menu đã có cache); bản ghi chỉ gọi API khi hộp đang mở, sau debounce, ≥ 2 ký tự, tối đa 5 kết quả / phân hệ, có cache theo từ khóa.
- **Mở rộng không sửa lõi**: registry theo app (`search.py`), thêm / bỏ app là thêm / bỏ nguồn tìm.
- **Lịch sử riêng từng người dùng**, chỉ lưu nhãn + đường dẫn đã hiển thị (không lưu dữ liệu nghiệp vụ), có nút xóa lịch sử. Quyền vẫn được kiểm tra lại khi mở trang.
- **Bàn phím đầy đủ**: ↑ ↓ di chuyển, Enter mở, Esc đóng (cmdk).

## 5. Giới hạn hiện tại & hướng mở rộng

- Tìm bản ghi ở backend **phân biệt dấu** (Postgres `icontains`). Muốn tìm không dấu: bật extension `unaccent` (migration `UnaccentExtension`) rồi đổi lookup sang `__unaccent__icontains`; dữ liệu lớn thêm `pg_trgm` + GIN index cho cột mã / tên.
- Dữ liệu rất lớn / cần tìm toàn văn (mô tả, ghi chú) → cân nhắc `SearchVector` của Postgres hoặc công cụ tìm kiếm riêng; giữ nguyên hợp đồng `/search/`.
- Lịch sử nằm ở trình duyệt (không đồng bộ giữa máy). Cần đồng bộ → lưu phía server theo người dùng.
