import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRecentSearch } from "./recentSearch";

const screen = (url: string) => ({ url, label: url, kind: "screen" as const });

describe("useRecentSearch", () => {
  it("đưa mục mới lên đầu, không trùng, tối đa 6 mục", () => {
    const { result } = renderHook(() => useRecentSearch(101));
    act(() => {
      for (let i = 1; i <= 7; i++) result.current.addItem(screen(`/p${i}`));
      result.current.addItem(screen("/p3"));
    });
    expect(result.current.items.map((x) => x.url)).toEqual(["/p3", "/p7", "/p6", "/p5", "/p4", "/p2"]);
  });

  it("lưu từ khóa không phân biệt hoa thường, bỏ chuỗi rỗng, tối đa 5", () => {
    const { result } = renderHook(() => useRecentSearch(102));
    act(() => {
      ["kl-0", "  ", "ong nhom", "KL-0", "a1", "a2", "a3", "a4"].forEach((q) => result.current.addQuery(q));
    });
    expect(result.current.queries).toEqual(["a4", "a3", "a2", "a1", "KL-0"]);
  });

  it("tách lịch sử theo người dùng và xóa được", () => {
    const a = renderHook(() => useRecentSearch(103));
    const b = renderHook(() => useRecentSearch(104));
    act(() => a.result.current.addItem(screen("/users")));
    expect(b.result.current.items).toEqual([]);
    act(() => a.result.current.clear());
    expect(a.result.current.items).toEqual([]);
  });
});
