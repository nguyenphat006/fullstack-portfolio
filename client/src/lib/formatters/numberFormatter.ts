import { DEFAULT_NUMBER_SETTINGS, type NumberFormatSettings } from "./numberConfig";

/**
 * Hàm định dạng số tổng quát dựa trên cấu hình settings
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: {
    decimals?: number;
    settings?: NumberFormatSettings;
    keepTrailingZeros?: boolean;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) {
    return String(value);
  }

  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : 2;
  const keepTrailingZeros = options?.keepTrailingZeros ?? true;

  // Làm tròn số theo decimals
  const fixedStr = num.toFixed(decimals);
  const [intPart, decPart] = fixedStr.split(".");

  // Chèn dấu phân cách hàng nghìn
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator);

  if (!decPart || decimals === 0) {
    return formattedInt;
  }

  // Cắt bỏ số 0 thừa nếu không yêu cầu keepTrailingZeros
  let finalDec = decPart;
  if (!keepTrailingZeros) {
    finalDec = finalDec.replace(/0+$/, "");
    if (!finalDec) return formattedInt;
  }

  return `${formattedInt}${settings.decimalSeparator}${finalDec}`;
}

/**
 * Định dạng tiền tệ: formatCurrency(1500000) -> "15,000,000 ₫"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    decimals?: number;
    symbol?: string;
    position?: "after" | "before";
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.currencyDecimals;
  const symbol = options?.symbol !== undefined ? options.symbol : settings.currencySymbol;
  const position = options?.position !== undefined ? options.position : settings.currencyPosition;

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";

  if (!symbol) return numStr;
  return position === "before" ? `${symbol}${numStr}` : `${numStr} ${symbol}`;
}

/**
 * Định dạng kích thước phôi kỹ thuật ($mm$): formatDimension(1800.5) -> "1,800.50 mm"
 */
export function formatDimension(
  value: number | string | null | undefined,
  options?: {
    unit?: string;
    decimals?: number;
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.dimensionDecimals;
  const unit = options?.unit !== undefined ? options.unit : "mm";

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";
  return unit ? `${numStr} ${unit}` : numStr;
}

/**
 * Định dạng định lượng / khối lượng ($kg$): formatWeight(1.234) -> "1.234 kg/m" hoặc "1.234 kg"
 */
export function formatWeight(
  value: number | string | null | undefined,
  options?: {
    unit?: string;
    decimals?: number;
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.weightDecimals;
  const unit = options?.unit !== undefined ? options.unit : "kg";

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";
  return unit ? `${numStr} ${unit}` : numStr;
}

/**
 * Định dạng thể tích / khối gỗ / hóa chất ($m^3$, $lít$): formatVolume(0.0045) -> "0.0045 m³"
 */
export function formatVolume(
  value: number | string | null | undefined,
  options?: {
    unit?: string;
    decimals?: number;
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.volumeDecimals;
  const unit = options?.unit !== undefined ? options.unit : "m³";

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";
  return unit ? `${numStr} ${unit}` : numStr;
}

/**
 * Định dạng tỷ lệ phần trăm / hao hụt (%): formatPercent(5.2) -> "5.2 %"
 */
export function formatPercent(
  value: number | string | null | undefined,
  options?: {
    decimals?: number;
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.percentDecimals;

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";
  return `${numStr} %`;
}

/**
 * Định dạng số lượng kiểm đếm (cái, cây, bộ): formatQuantity(1250, "cây") -> "1,250 cây"
 */
export function formatQuantity(
  value: number | string | null | undefined,
  options?: {
    unit?: string;
    decimals?: number;
    settings?: NumberFormatSettings;
  }
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const settings = options?.settings || DEFAULT_NUMBER_SETTINGS;
  const decimals = options?.decimals !== undefined ? options.decimals : settings.quantityDecimals;
  const unit = options?.unit;

  const numStr = formatNumber(value, { decimals, settings });
  if (numStr === "—") return "—";
  return unit ? `${numStr} ${unit}` : numStr;
}

/**
 * Helper sinh Formatter cho Ant Design InputNumber:
 * Tự động chèn dấu phân cách hàng nghìn khi người dùng gõ
 */
export function createInputNumberFormatter(settings?: NumberFormatSettings) {
  const currentSettings = settings || DEFAULT_NUMBER_SETTINGS;
  return (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === "") return "";
    const str = `${value}`;
    const [intPart, decPart] = str.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currentSettings.thousandSeparator);
    if (decPart !== undefined) {
      return `${formattedInt}${currentSettings.decimalSeparator}${decPart}`;
    }
    return formattedInt;
  };
}

/**
 * Helper sinh Parser cho Ant Design InputNumber:
 * Chuyển đổi chuỗi hiển thị thành số thuần number để lưu vào form/state
 */
export function createInputNumberParser(settings?: NumberFormatSettings) {
  const currentSettings = settings || DEFAULT_NUMBER_SETTINGS;
  return (displayValue: string | undefined): number => {
    if (!displayValue) return undefined as unknown as number;

    // Thay thế ký hiệu tiền tệ hoặc khoảng trắng
    let cleaned = displayValue.replace(/[₫\$đVNĐ\s]/g, "");

    if (currentSettings.style === "vietnam") {
      // Kiểu VN: Dấu chấm hàng nghìn -> xóa bỏ; Dấu phẩy thập phân -> đổi thành dấu chấm
      cleaned = cleaned.split(".").join("").replace(",", ".");
    } else {
      // Kiểu Quốc tế: Dấu phẩy hàng nghìn -> xóa bỏ
      cleaned = cleaned.replace(/,/g, "");
    }

    const parsed = Number(cleaned);
    return isNaN(parsed) ? (undefined as unknown as number) : parsed;
  };
}
