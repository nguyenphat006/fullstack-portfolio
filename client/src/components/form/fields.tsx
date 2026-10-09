"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useController, useFormContext, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, type ComboOption } from "@/components/controls/Combobox";
import { NumberInput } from "@/components/controls/NumberInput";
import { TreeSelect, type TreeNode } from "@/components/controls/TreeSelect";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  id: string;
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Khung 1 trường: nhãn · ô nhập · gợi ý / lỗi (dùng trong FormSection) */
export function FieldShell({ id, label, required, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={cn("form-field", className)}>
      {label && (
        <Label htmlFor={id} className="form-field__label">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="form-field__error">
          {error}
        </p>
      ) : hint ? (
        <p className="form-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

interface BaseFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: React.ReactNode;
  rules?: RegisterOptions<T, Path<T>>;
  hint?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function useField<T extends FieldValues>({ name, rules }: BaseFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  return { field, error: fieldState.error?.message, id: `f-${String(name)}` };
}

export function TextField<T extends FieldValues>(
  props: BaseFieldProps<T> & { placeholder?: string; type?: string; autoComplete?: string; transform?: (v: string) => string; inputClassName?: string },
) {
  const { field, error, id } = useField(props);
  return (
    <FieldShell id={id} label={props.label} required={Boolean(props.rules?.required)} hint={props.hint} error={error} className={props.className}>
      <Input
        id={id}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        aria-invalid={Boolean(error)}
        className={props.inputClassName}
        {...field}
        value={(field.value as string) ?? ""}
        onChange={(e) => field.onChange(props.transform ? props.transform(e.target.value) : e.target.value)}
      />
    </FieldShell>
  );
}

export function TextareaField<T extends FieldValues>(props: BaseFieldProps<T> & { placeholder?: string; rows?: number; maxLength?: number }) {
  const { field, error, id } = useField(props);
  const length = String(field.value ?? "").length;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={Boolean(props.rules?.required)}
      hint={props.maxLength ? `${length}/${props.maxLength}` : props.hint}
      error={error}
      className={props.className}
    >
      <Textarea
        id={id}
        rows={props.rows ?? 3}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-invalid={Boolean(error)}
        {...field}
        value={(field.value as string) ?? ""}
      />
    </FieldShell>
  );
}

export function NumberField<T extends FieldValues>(props: BaseFieldProps<T> & { suffix?: React.ReactNode; min?: number; max?: number; placeholder?: string }) {
  const { field, error, id } = useField(props);
  return (
    <FieldShell id={id} label={props.label} required={Boolean(props.rules?.required)} hint={props.hint} error={error} className={props.className}>
      <NumberInput
        id={id}
        value={field.value as number | null}
        onChange={field.onChange}
        onBlur={field.onBlur}
        suffix={props.suffix}
        min={props.min}
        max={props.max}
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-invalid={Boolean(error)}
      />
    </FieldShell>
  );
}

export function SwitchField<T extends FieldValues>(props: BaseFieldProps<T> & { onText?: string; offText?: string }) {
  const { field, error, id } = useField(props);
  const on = Boolean(field.value);
  return (
    <FieldShell id={id} label={props.label} hint={props.hint} error={error} className={props.className}>
      <div className="flex h-9 items-center gap-2">
        <Switch id={id} checked={on} onCheckedChange={field.onChange} disabled={props.disabled} />
        {(props.onText || props.offText) && <span className="text-sm text-muted-foreground">{on ? props.onText : props.offText}</span>}
      </div>
    </FieldShell>
  );
}

/** Danh sách ngắn (≤ 7 lựa chọn) */
export function SelectField<T extends FieldValues>(props: BaseFieldProps<T> & { options: ComboOption[]; placeholder?: string }) {
  const t = useTranslations("form");
  const { field, error, id } = useField(props);
  return (
    <FieldShell id={id} label={props.label} required={Boolean(props.rules?.required)} hint={props.hint} error={error} className={props.className}>
      {/* Radix Select phát onValueChange("") khi danh sách lựa chọn gắn lại (reset form) -> bỏ qua, giữ giá trị đang có */}
      <Select value={field.value == null ? "" : String(field.value)} onValueChange={(v) => v !== "" && field.onChange(v)} disabled={props.disabled}>
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={props.placeholder ?? t("selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((o) => (
            <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

/** Danh sách dài có ô tìm; `multiple` cho chọn nhiều. Giá trị trong form giữ nguyên kiểu number nếu options là số. */
export function ComboboxField<T extends FieldValues>(
  props: BaseFieldProps<T> & { options: ComboOption[]; placeholder?: string; multiple?: boolean; numeric?: boolean; allowClear?: boolean },
) {
  const { field, error, id } = useField(props);
  const toOut = (v: string) => (props.numeric ? Number(v) : v);
  return (
    <FieldShell id={id} label={props.label} required={Boolean(props.rules?.required)} hint={props.hint} error={error} className={props.className}>
      {props.multiple ? (
        <Combobox
          id={id}
          multiple
          options={props.options}
          value={((field.value as unknown[]) ?? []).map(String)}
          onChange={(v) => field.onChange(v.map(toOut))}
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          disabled={props.disabled}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <Combobox
          id={id}
          options={props.options}
          value={field.value == null ? null : String(field.value)}
          onChange={(v) => field.onChange(v === null ? null : toOut(v))}
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          disabled={props.disabled}
          aria-invalid={Boolean(error)}
        />
      )}
    </FieldShell>
  );
}

export function TreeSelectField<T extends FieldValues>(props: BaseFieldProps<T> & { tree: TreeNode[]; placeholder?: string; allowClear?: boolean; numeric?: boolean }) {
  const { field, error, id } = useField(props);
  return (
    <FieldShell id={id} label={props.label} required={Boolean(props.rules?.required)} hint={props.hint} error={error} className={props.className}>
      <TreeSelect
        id={id}
        tree={props.tree}
        value={field.value == null ? null : String(field.value)}
        onChange={(v) => field.onChange(v === null ? null : props.numeric ? Number(v) : v)}
        placeholder={props.placeholder}
        allowClear={props.allowClear}
        disabled={props.disabled}
        aria-invalid={Boolean(error)}
      />
    </FieldShell>
  );
}
