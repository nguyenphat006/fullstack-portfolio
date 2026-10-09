import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize";

describe("normalizeText", () => {
  it("bỏ dấu tiếng Việt, đ → d, chữ thường, cắt khoảng trắng", () => {
    expect(normalizeText("  Nguyên Vật Liệu ")).toBe("nguyen vat lieu");
    expect(normalizeText("Đơn vị tính")).toBe("don vi tinh");
  });

  it("chuỗi đã dựng sẵn (NFC) và tổ hợp (NFD) cho cùng kết quả", () => {
    expect(normalizeText("Thép".normalize("NFC"))).toBe(normalizeText("Thép".normalize("NFD")));
  });

  it("null / undefined → chuỗi rỗng", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });
});
