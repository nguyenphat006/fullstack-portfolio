import * as XLSX from "xlsx";

/** Dữ liệu 1 trang tính để hiển thị: tên cột A, B, C… và các dòng giá trị */
export interface SheetTableData {
  columns: string[];
  rows: unknown[][];
}

export const EMPTY_SHEET_DATA: SheetTableData = { columns: [], rows: [] };

/** Tối đa 60 cột để bảng xem trước không quá nặng */
const MAX_COLS = 60;

export function parseSheetToTable(sheet: XLSX.WorkSheet): SheetTableData | null {
  try {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false });
    if (!rows?.length) return EMPTY_SHEET_DATA;
    const colCount = Math.min(MAX_COLS, rows.reduce((max, r) => Math.max(max, r.length), 0));
    return {
      columns: Array.from({ length: colCount }, (_, c) => XLSX.utils.encode_col(c)),
      rows: rows.map((r) => Array.from({ length: colCount }, (_, c) => r[c] ?? "")),
    };
  } catch (err) {
    console.error("Lỗi đọc trang tính:", err);
    return null;
  }
}
