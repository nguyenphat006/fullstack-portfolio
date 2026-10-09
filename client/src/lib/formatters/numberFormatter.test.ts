import { describe, expect, it } from "vitest";
import { DEFAULT_NUMBER_SETTINGS as INTL, VIETNAM_NUMBER_SETTINGS as VN } from "./numberConfig";
import {
  createInputNumberFormatter,
  createInputNumberParser,
  formatCurrency,
  formatDimension,
  formatNumber,
  formatPercent,
  formatVolume,
  formatWeight,
} from "./numberFormatter";

describe("formatNumber", () => {
  it("quốc tế và Việt Nam", () => {
    expect(formatNumber(1250000.5, { settings: INTL })).toBe("1,250,000.50");
    expect(formatNumber(1250000.5, { settings: VN })).toBe("1.250.000,50");
  });

  it("làm tròn, bỏ số 0 thừa khi yêu cầu", () => {
    expect(formatNumber(1.005, { decimals: 0 })).toBe("1");
    expect(formatNumber(2.5, { decimals: 3, keepTrailingZeros: false })).toBe("2.5");
    expect(formatNumber(2, { decimals: 3, keepTrailingZeros: false })).toBe("2");
  });

  it("số âm, chuỗi số, giá trị trống / không phải số", () => {
    expect(formatNumber(-1234.5, { decimals: 1 })).toBe("-1,234.5");
    expect(formatNumber("1500", { decimals: 0 })).toBe("1,500");
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber("")).toBe("—");
    expect(formatNumber("abc")).toBe("abc");
  });
});

describe("helper theo nghiệp vụ dùng số lẻ và đơn vị mặc định", () => {
  it.each([
    [formatCurrency(1500000, { settings: INTL }), "1,500,000 ₫"],
    [formatCurrency(1500000, { settings: VN }), "1.500.000 đ"],
    [formatCurrency(12.5, { symbol: "$", position: "before", decimals: 2 }), "$12.50"],
    [formatDimension(1800.5), "1,800.50 mm"],
    [formatWeight(1.2346, { settings: VN }), "1,235 kg"],
    [formatVolume(0.0045), "0.0045 m³"],
    [formatPercent(5.25), "5.3 %"],
    [formatDimension(undefined), "—"],
  ])("%s", (actual, expected) => {
    expect(actual).toBe(expected);
  });
});

describe("ô nhập số: formatter ↔ parser", () => {
  it.each([
    ["quốc tế", INTL, 1234567.89, "1,234,567.89"],
    ["Việt Nam", VN, 1234567.89, "1.234.567,89"],
  ])("%s: hiển thị rồi đọc lại đúng số", (_, settings, value, display) => {
    expect(createInputNumberFormatter(settings)(value)).toBe(display);
    expect(createInputNumberParser(settings)(display)).toBe(value);
  });

  it("parser bỏ ký hiệu tiền, trả undefined khi rỗng / không phải số", () => {
    expect(createInputNumberParser(VN)("1.500.000 đ")).toBe(1500000);
    expect(createInputNumberParser(INTL)("")).toBeUndefined();
    expect(createInputNumberParser(INTL)("abc")).toBeUndefined();
  });
});
