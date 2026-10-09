"use client";

import React, { useMemo } from "react";
import { useLocale } from "next-intl";
import { COUNTRY_CODES, countryName } from "@/lib/countries";
import { CountryFlag } from "@/components/common/CountryFlag";
import type { ComboOption } from "./Combobox";

/**
 * Lựa chọn quốc gia cho `Combobox` / bộ lọc: cờ + nhãn theo ngôn ngữ hiện tại, mã ISO ở cột mã (tìm được cả theo mã),
 * sắp theo tên. Tính một lần cho mỗi ngôn ngữ.
 */
export function useCountryOptions(): ComboOption[] {
  const locale = useLocale();
  return useMemo(() => {
    const collator = new Intl.Collator(locale);
    return COUNTRY_CODES.map((code) => ({ value: code, label: countryName(code, locale), code, icon: React.createElement(CountryFlag, { code }) })).sort((a, b) => collator.compare(a.label, b.label));
  }, [locale]);
}

/** Hàm đổi mã → tên theo ngôn ngữ hiện tại (dùng trong cột bảng, hero…) */
export function useCountryName() {
  const locale = useLocale();
  return (code: string | null | undefined) => countryName(code, locale);
}
