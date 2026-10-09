import { describe, expect, it } from "vitest";
import { flattenNavigation, searchRoutes } from "./searchNavigation";
import type { NavigationItem } from "@/services/navigation.service";

const item = (code: string, label: string, key: string, children?: NavigationItem[]) => ({ code, label, key, children }) as NavigationItem;

const NAV = [
  item("DASHBOARD", "Tổng quan", "/dashboard"),
  item("MASTER_DATA", "Danh mục", "master-data", [
    item("UNIT", "Đơn vị tính", "/master-data/units"),
    item("MATERIAL", "Nguyên vật liệu", "/master-data/materials"),
    item("MATERIAL_CATEGORY", "Nhóm nguyên vật liệu", "/master-data/material-categories"),
  ]),
];

describe("flattenNavigation", () => {
  it("chỉ lấy mục có đường dẫn, gắn nhãn nhóm cha", () => {
    const routes = flattenNavigation(NAV);
    expect(routes.map((r) => r.key)).toEqual(["/dashboard", "/master-data/units", "/master-data/materials", "/master-data/material-categories"]);
    expect(routes[1].group).toBe("Danh mục");
  });
});

describe("searchRoutes", () => {
  const routes = flattenNavigation(NAV);
  const labels = (q: string) => searchRoutes(routes, q).map((r) => r.label);

  it("không phân biệt dấu, mọi từ khóa phải khớp", () => {
    expect(labels("don vi")).toEqual(["Đơn vị tính"]);
    expect(labels("nhom vat")).toEqual(["Nhóm nguyên vật liệu"]);
  });

  it("nhãn bắt đầu bằng từ khóa xếp trước nhãn chứa từ khóa", () => {
    expect(labels("nguyen")).toEqual(["Nguyên vật liệu", "Nhóm nguyên vật liệu"]);
  });

  it("khớp theo nhóm cha, mã phân hệ; từ khóa rỗng → không có kết quả", () => {
    expect(labels("danh muc")).toHaveLength(3);
    expect(labels("material_category")).toEqual(["Nhóm nguyên vật liệu"]);
    expect(labels("   ")).toEqual([]);
  });

  it("giới hạn số kết quả", () => {
    expect(searchRoutes(routes, "danh muc", 2)).toHaveLength(2);
  });
});
