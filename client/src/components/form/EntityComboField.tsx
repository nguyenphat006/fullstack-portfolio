"use client";

import React from "react";
import { useController, useFormContext, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Combobox } from "@/components/controls/Combobox";
import { useEntityOptions, type EntityOptionsSource } from "@/components/controls/useEntityOptions";
import { FieldShell } from "./fields";

export { useEntityOptions, type EntityFetchParams, type EntityOptionsSource } from "@/components/controls/useEntityOptions";

interface EntityComboFieldProps<T extends FieldValues, TItem> extends EntityOptionsSource<TItem> {
  name: Path<T>;
  label?: React.ReactNode;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  hint?: React.ReactNode;
  className?: string;
  /** Giá trị trong form là số (id) */
  numeric?: boolean;
}

/** Trường chọn thực thể động (ĐVT, người dùng, khách hàng…) */
export function EntityComboField<T extends FieldValues, TItem>({ name, label, rules, placeholder, hint, className, numeric = true, ...source }: EntityComboFieldProps<T, TItem>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const opts = useEntityOptions(source);
  const id = `f-${String(name)}`;
  return (
    <FieldShell id={id} label={label} required={Boolean(rules?.required)} hint={hint} error={fieldState.error?.message} className={className}>
      <Combobox
        id={id}
        options={opts.options}
        value={field.value == null ? null : String(field.value)}
        onChange={(v) => field.onChange(v === null ? null : numeric ? Number(v) : v)}
        placeholder={placeholder}
        onSearch={opts.onSearch}
        onReachEnd={opts.onReachEnd}
        onOpenChange={opts.onOpenChange}
        loading={opts.loading}
        hasMore={opts.hasMore}
        aria-invalid={Boolean(fieldState.error)}
      />
    </FieldShell>
  );
}
