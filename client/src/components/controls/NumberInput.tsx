"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useNumberFormat } from "@/providers/NumberFormatProvider";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  /** Hậu tố hiển thị bên phải (mm, kg, ₫…) */
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
}

/**
 * Ô nhập số theo định dạng người dùng (1,250.50 / 1.250,50) — hiển thị có phân cách khi rời ô,
 * gõ tự do khi đang nhập. Giá trị ra là number | null.
 */
export function NumberInput({ value, onChange, suffix, className, min, max, onBlur, onFocus, ...rest }: NumberInputProps) {
  const { inputFormatter, inputParser } = useNumberFormat();
  const [text, setText] = useState(value === null || value === undefined ? "" : inputFormatter(String(value)));
  const [focused, setFocused] = useState(false);

  // Đồng bộ khi giá trị đổi từ ngoài (reset form, sửa bản ghi khác)
  useEffect(() => {
    if (!focused) setText(value === null || value === undefined ? "" : inputFormatter(String(value))); // eslint-disable-line react-hooks/set-state-in-effect
  }, [value, focused, inputFormatter]);

  const commit = (raw: string) => {
    const parsed = raw.trim() === "" ? null : Number(inputParser(raw));
    if (parsed === null || Number.isNaN(parsed)) return onChange(null);
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed));
    onChange(clamped);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        {...rest}
        inputMode="decimal"
        value={text}
        className={cn(suffix && "pr-12", "text-right tabular-nums")}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onChange={(e) => {
          setText(e.target.value);
          commit(e.target.value);
        }}
        onBlur={(e) => {
          setFocused(false);
          setText(value === null || value === undefined ? "" : inputFormatter(String(value)));
          onBlur?.(e);
        }}
      />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}
