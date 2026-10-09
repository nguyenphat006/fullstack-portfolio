import { describe, expect, it } from "vitest";
import { clearFilterPatch, filterParamKeys, formatDateParam, isFilterActive, readFilter, writeFilter } from "./filters";
import type { ColumnFilter, ListColumn } from "./types";

type Row = Record<string, unknown>;

const col = (key: string, filter: ColumnFilter, extra: Partial<ListColumn<Row>> = {}): ListColumn<Row> => ({ key, title: key, filter, ...extra });

describe("filterParamKeys — tên tham số API theo kiểu bộ lọc", () => {
  it.each([
    [col("code", { type: "text" }), ["code__icontains"]],
    [col("is_active", { type: "select", options: [] }), ["is_active"]],
    [col("is_active", { type: "boolean" }), ["is_active"]],
    [col("category", { type: "multiSelect", options: [] }), ["category__in"]],
    [col("category", { type: "tree", treeData: [] }), ["category__in"]],
    [col("owner", { type: "remote", fetchOptions: async () => [] }), ["owner__in"]],
    [col("qty", { type: "number" }), ["qty__gte", "qty__lte"]],
    [col("updated_at", { type: "date" }), ["updated_at__date__gte", "updated_at__date__lte"]],
  ])("%#: %o", (column, expected) => {
    expect(filterParamKeys(column)).toEqual(expected);
  });

  it("ưu tiên filterField, rồi param / params", () => {
    expect(filterParamKeys(col("category_name", { type: "multiSelect", options: [] }, { filterField: "category" }))).toEqual(["category__in"]);
    expect(filterParamKeys(col("code", { type: "text", param: "search_code" }))).toEqual(["search_code"]);
    expect(filterParamKeys(col("created", { type: "date", params: ["date_from", "date_to"] }))).toEqual(["date_from", "date_to"]);
  });

  it("cột không có bộ lọc → không có tham số", () => {
    expect(filterParamKeys({ key: "name", title: "name" })).toEqual([]);
  });
});

describe("readFilter / writeFilter — đọc, ghi giá trị trên URL", () => {
  const multi = col("category", { type: "multiSelect", options: [] });
  const range = col("qty", { type: "number" });
  const text = col("code", { type: "text" });

  it("chọn nhiều: tách / nối bằng dấu phẩy, mảng rỗng xóa tham số", () => {
    expect(readFilter(multi, { category__in: "3,5" })).toEqual(["3", "5"]);
    expect(writeFilter(multi, ["3", "5"])).toEqual({ category__in: "3,5" });
    expect(writeFilter(multi, [])).toEqual({ category__in: null });
  });

  it("khoảng: có một đầu vẫn là đang lọc, rỗng cả hai → null", () => {
    expect(readFilter(range, { qty__gte: "10" })).toEqual(["10", null]);
    expect(readFilter(range, {})).toBeNull();
    expect(writeFilter(range, [null, "20"])).toEqual({ qty__gte: null, qty__lte: "20" });
    expect(writeFilter(range, null)).toEqual({ qty__gte: null, qty__lte: null });
  });

  it("chữ: chuỗi rỗng xóa tham số", () => {
    expect(readFilter(text, { code__icontains: "AB" })).toBe("AB");
    expect(writeFilter(text, "")).toEqual({ code__icontains: null });
  });

  it("isFilterActive và clearFilterPatch dùng đúng các tham số của cột", () => {
    expect(isFilterActive(range, { qty__lte: "5" })).toBe(true);
    expect(isFilterActive(range, { other: "5" })).toBe(false);
    expect(clearFilterPatch(range)).toEqual({ qty__gte: null, qty__lte: null });
  });
});

describe("formatDateParam", () => {
  it("đổi ISO sang dd/mm/yyyy, giữ nguyên chuỗi không hợp lệ", () => {
    expect(formatDateParam("2026-09-30")).toBe("30/09/2026");
    expect(formatDateParam("hôm nay")).toBe("hôm nay");
  });
});
