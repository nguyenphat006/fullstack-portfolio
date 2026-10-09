"use client";

import React from "react";
import type { FieldValues } from "react-hook-form";
import { useCountryOptions } from "@/components/controls/useCountryOptions";
import { ComboboxField } from "./fields";

type ComboboxFieldProps<T extends FieldValues> = React.ComponentProps<typeof ComboboxField<T>>;

/** Ô chọn quốc gia (mã ISO 3166-1 alpha-2, tên theo ngôn ngữ đang dùng) — dùng chung cho mọi form có trường quốc gia. */
export function CountryField<T extends FieldValues>(props: Omit<ComboboxFieldProps<T>, "options">) {
  const options = useCountryOptions();
  return <ComboboxField<T> allowClear {...props} options={options} />;
}
