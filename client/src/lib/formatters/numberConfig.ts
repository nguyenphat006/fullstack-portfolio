/**
 * Cấu hình quy chuẩn định dạng số học toàn hệ thống Admin Template
 */

export type NumberFormatStyle = "international" | "vietnam";

export interface NumberFormatSettings {
  // Phong cách định dạng
  style: NumberFormatStyle; // "international" (1,250,000.50) | "vietnam" (1.250.000,50)
  thousandSeparator: string; // "," hoặc "." hoặc " "
  decimalSeparator: string; // "." hoặc ","
  
  // Độ chính xác số lẻ sau dấu phẩy cho từng nhóm nghiệp vụ
  currencyDecimals: number; // Tiền tệ VNĐ: mặc định 0, USD: 2
  currencySymbol: string; // "₫", "VNĐ", "$"
  currencyPosition: "after" | "before"; // "15,000 ₫" hoặc "$15,000"
  
  dimensionDecimals: number; // Kích thước phôi (mm): mặc định 2
  weightDecimals: number; // Định lượng / Khối lượng (kg): mặc định 3
  volumeDecimals: number; // Thể tích / Khối gỗ / Dung tích (m³): mặc định 4
  percentDecimals: number; // Tỷ lệ hao hụt / Thuế (%): mặc định 1
  quantityDecimals: number; // Số lượng kiểm đếm tồn kho: mặc định 0
}

/**
 * Cấu hình Mặc định Kiểu A (Chuẩn Quốc tế, CAD & Kỹ thuật máy tính):
 * Phân cách hàng nghìn: Dấu phẩy (,)
 * Phân cách số lẻ thập phân: Dấu chấm (.)
 */
export const DEFAULT_NUMBER_SETTINGS: NumberFormatSettings = {
  style: "international",
  thousandSeparator: ",",
  decimalSeparator: ".",
  currencyDecimals: 0,
  currencySymbol: "₫",
  currencyPosition: "after",
  dimensionDecimals: 2,
  weightDecimals: 3,
  volumeDecimals: 4,
  percentDecimals: 1,
  quantityDecimals: 0,
};

/**
 * Cấu hình Kiểu B (Chuẩn Kế toán Việt Nam TCVN):
 * Phân cách hàng nghìn: Dấu chấm (.)
 * Phân cách số lẻ thập phân: Dấu phẩy (,)
 */
export const VIETNAM_NUMBER_SETTINGS: NumberFormatSettings = {
  style: "vietnam",
  thousandSeparator: ".",
  decimalSeparator: ",",
  currencyDecimals: 0,
  currencySymbol: "đ",
  currencyPosition: "after",
  dimensionDecimals: 2,
  weightDecimals: 3,
  volumeDecimals: 4,
  percentDecimals: 1,
  quantityDecimals: 0,
};

const STORAGE_KEY = "app_number_format_settings";

/**
 * Đọc cấu hình từ LocalStorage
 */
export function getStoredNumberSettings(): NumberFormatSettings {
  if (typeof window === "undefined") {
    return DEFAULT_NUMBER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NUMBER_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_NUMBER_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_NUMBER_SETTINGS;
  }
}

/** User đã tự chọn định dạng số chưa (chưa -> dùng mặc định của Cấu hình hệ thống) */
export function hasStoredNumberSettings(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Lưu cấu hình vào LocalStorage
 */
export function saveStoredNumberSettings(settings: NumberFormatSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Lỗi khi lưu cấu hình định dạng số:", err);
  }
}
