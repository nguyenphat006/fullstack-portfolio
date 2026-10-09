import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useListState } from "./useListState";

const nav = vi.hoisted(() => ({ query: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => "/master-data/units",
  useSearchParams: () => new URLSearchParams(nav.query),
}));

/** URL mà hook vừa yêu cầu chuyển tới */
const lastUrl = () => nav.replace.mock.lastCall?.[0] as string;

describe("useListState — trạng thái danh sách trên URL", () => {
  beforeEach(() => {
    nav.query = "";
    nav.replace.mockClear();
  });

  it("đọc tìm kiếm, trang, sắp xếp, bộ lọc từ URL thành tham số API", () => {
    nav.query = "q=thep&page=3&page_size=50&ordering=code&is_active=true&category__in=3,5";
    const { result } = renderHook(() => useListState());
    expect(result.current.filters).toEqual({ is_active: "true", category__in: "3,5" });
    expect(result.current.params).toEqual({
      is_active: "true",
      category__in: "3,5",
      page: 3,
      page_size: 50,
      search: "thep",
      ordering: "code",
    });
    expect(result.current.hasFilters).toBe(true);
  });

  it("URL trống → trang 1, cỡ trang mặc định, sắp xếp mặc định chỉ gửi API", () => {
    const { result } = renderHook(() => useListState({ defaultOrdering: "-updated_at" }));
    expect(result.current.params).toEqual({ page: 1, page_size: 20, ordering: "-updated_at" });
    expect(result.current.ordering).toBeNull();
    expect(result.current.hasFilters).toBe(false);
  });

  it("đổi bộ lọc → về trang 1, giá trị rỗng xóa tham số", () => {
    nav.query = "page=4&is_active=true";
    const { result } = renderHook(() => useListState());
    result.current.setFilters({ is_active: null, category__in: "7" });
    expect(lastUrl()).toBe("/master-data/units?category__in=7");
  });

  it("tìm kiếm cắt khoảng trắng và về trang 1", () => {
    nav.query = "page=2";
    const { result } = renderHook(() => useListState());
    result.current.setSearch("  nhom  ");
    expect(lastUrl()).toBe("/master-data/units?q=nhom");
  });

  it("chuyển trang giữ bộ lọc; đổi cỡ trang → về trang 1; giá trị mặc định không ghi lên URL", () => {
    nav.query = "is_active=true";
    const { result } = renderHook(() => useListState());
    result.current.setPage(2);
    expect(lastUrl()).toBe("/master-data/units?is_active=true&page=2");
    result.current.setPage(3, 50);
    expect(lastUrl()).toBe("/master-data/units?is_active=true&page_size=50");
    result.current.setPage(1);
    expect(lastUrl()).toBe("/master-data/units?is_active=true");
  });

  it("xóa bộ lọc giữ sắp xếp", () => {
    nav.query = "q=abc&ordering=-code&is_active=false";
    const { result } = renderHook(() => useListState());
    result.current.clearFilters();
    expect(lastUrl()).toBe("/master-data/units?ordering=-code");
  });
});
