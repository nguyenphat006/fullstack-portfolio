/** Tháng dạng "YYYY-MM" */
export type YearMonth = string;
export interface Period {
  from: YearMonth | null;
  /** null = chưa chọn, "present" = đến nay */
  to: YearMonth | "present" | null;
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

const viMonth = (ym: YearMonth) => { const [y, m] = ym.split("-"); return `${m}/${y}`; };
const enMonth = (ym: YearMonth) => { const [y, m] = ym.split("-"); return `${EN_MONTHS[Number(m) - 1]} ${y}`; };

/** Khoảng thời gian -> chuỗi hiển thị: vi "05/2025 - 08/2025", en "May 2025 - Aug 2025" (cùng tháng -> chỉ một mốc) */
export function formatPeriod(period: Period, locale: "vi" | "en"): string {
  if (!period.from) return "";
  const one = locale === "vi" ? viMonth : enMonth;
  if (!period.to || period.to === period.from) return one(period.from);
  const end = period.to === "present" ? (locale === "vi" ? "Hiện tại" : "Present") : one(period.to);
  return `${one(period.from)} - ${end}`;
}

/** Đọc lại chuỗi đã lưu ("05/2025 - 08/2025", "11/2024 — Hiện tại", "2026") -> Period; không đọc được -> rỗng */
export function parsePeriod(text: string | null | undefined): Period {
  if (!text) return { from: null, to: null };
  const parts = text.split(/\s+[-—–]\s+/);
  const one = (s: string): YearMonth | null => {
    const mmYYYY = s.trim().match(/^(\d{1,2})\/(\d{4})$/);
    if (mmYYYY) return `${mmYYYY[2]}-${pad(Number(mmYYYY[1]))}`;
    const yyyy = s.trim().match(/^(\d{4})$/);
    return yyyy ? `${yyyy[1]}-01` : null;
  };
  const from = one(parts[0] ?? "");
  if (parts.length < 2) return { from, to: null };
  const end = parts[1].trim();
  return { from, to: /^(hiện tại|present|nay)$/i.test(end) ? "present" : one(end) };
}

/** Ngày "YYYY-MM-DD" -> vi "10/03/2026", en "Mar 10, 2026" */
export function formatDay(iso: string, locale: "vi" | "en"): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return locale === "vi" ? `${pad(d)}/${pad(m)}/${y}` : `${EN_MONTHS[m - 1]} ${d}, ${y}`;
}

/** "10/03/2026" -> "2026-03-10" (không đọc được -> null) */
export function parseViDay(text: string | null | undefined): string | null {
  const m = text?.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}` : null;
}
