import { describe, expect, it } from "vitest";
import { moveColumnKey, resolveColumns } from "./columnLayout";
import type { ListPreferences } from "./useListPreferences";
import type { ListColumn } from "./types";

type Row = Record<string, unknown>;

const COLUMNS: ListColumn<Row>[] = [
  { key: "code", title: "Mã", pinned: "left", hideable: false },
  { key: "name", title: "Tên" },
  { key: "note", title: "Ghi chú", defaultHidden: true },
  { key: "status", title: "Trạng thái" },
];

const prefs = (patch: Partial<ListPreferences> = {}): ListPreferences => ({ density: "middle", order: [], visibility: {}, pinned: {}, widths: {}, ...patch });
const keys = (cols: ListColumn<Row>[]) => cols.map((c) => c.key);

describe("resolveColumns — áp tùy chỉnh cột của người dùng", () => {
  it("mặc định: theo khai báo, ẩn cột defaultHidden", () => {
    const r = resolveColumns(COLUMNS, prefs());
    expect(keys(r.visible)).toEqual(["code", "name", "status"]);
  });

  it("thứ tự đã lưu + cột mới thêm sau cùng, bỏ key không còn tồn tại", () => {
    const r = resolveColumns(COLUMNS, prefs({ order: ["status", "gone", "name"] }));
    expect(r.orderKeys).toEqual(["status", "name", "code", "note"]);
  });

  it("bật / tắt cột, nhưng không ẩn được cột hideable: false", () => {
    const r = resolveColumns(COLUMNS, prefs({ visibility: { note: true, name: false, code: false } }));
    expect(keys(r.visible)).toEqual(["code", "note", "status"]);
  });

  it("gom cột ghim trái → giữa → ghim phải; ghim của người dùng ghi đè khai báo", () => {
    const r = resolveColumns(COLUMNS, prefs({ pinned: { status: "left", code: false, name: "right" } }));
    expect(keys(r.visible)).toEqual(["status", "code", "name"]);
  });
});

describe("moveColumnKey — đổi chỗ với cột đang hiện liền kề", () => {
  const order = ["code", "name", "note", "status"];
  const visible = ["code", "name", "status"]; // note đang ẩn

  it("bỏ qua cột ẩn khi đổi chỗ", () => {
    expect(moveColumnKey(order, visible, "name", 1)).toEqual(["code", "status", "note", "name"]);
  });

  it("ở biên hoặc key lạ → giữ nguyên", () => {
    expect(moveColumnKey(order, visible, "code", -1)).toBe(order);
    expect(moveColumnKey(order, visible, "xyz", 1)).toBe(order);
  });
});
