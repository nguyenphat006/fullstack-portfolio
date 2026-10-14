"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { cn } from "@/lib/utils";
import { IMAGE_KEYS, LONG_TEXT, NEUTRAL_KEYS, blankLike, humanize, isObject, type Json } from "./jsonTools";

interface Ctx {
  /** Tab tiếng Anh: khóa trung lập chỉ đọc (sửa ở tab tiếng Việt) */
  lockNeutral: boolean;
  upload: (file: File) => Promise<string>;
  label: (key: string) => string;
}

/** Ô ảnh nhỏ: xem trước + chọn / đổi / bỏ ảnh (tải lên server) */
function ImageInput({ value, onChange, upload, disabled }: { value: string; onChange: (v: string) => void; upload: Ctx["upload"]; disabled?: boolean }) {
  const t = useTranslations("form.cover");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (error) {
      toast.error(extractErrorMessage(error, t("hint")));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ API / thư mục public / CDN */}
        {value ? <img src={value} alt="" className="size-full object-contain p-1" /> : <ImagePlus className="size-5 text-muted-foreground" />}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-background/70"><Loader2 className="size-4 animate-spin" /></div>}
      </div>
      {!disabled && (
        <div className="flex gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
            {value ? t("replace") : t("choose")}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} aria-label={t("remove")}>
              <X />
            </Button>
          )}
        </div>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

/** Danh sách chuỗi (vd. các ý trong mô tả kinh nghiệm) */
function StringList({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const t = useTranslations("landing.editor");
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Textarea rows={1} value={item} disabled={disabled} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} className="min-h-9" />
          {!disabled && (
            <Button type="button" variant="ghost" size="icon" aria-label={t("remove")} onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X />
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, ""])}>
          <Plus /> {t("addLine")}
        </Button>
      )}
    </div>
  );
}

/** Danh sách đối tượng (kinh nghiệm, nhận xét…): mỗi mục một thẻ thu gọn được, thêm / xóa / đổi thứ tự */
function ObjectList({ value, onChange, ctx }: { value: Json[]; onChange: (v: Json[]) => void; ctx: Ctx }) {
  const t = useTranslations("landing.editor");
  const [open, setOpen] = useState<number | null>(0);
  const titleOf = (item: Json, i: number) => {
    if (isObject(item)) {
      const first = ["company", "school", "name", "label", "title", "category"].map((k) => item[k]).find((v) => typeof v === "string" && v);
      if (first) return String(first);
    }
    return `#${i + 1}`;
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
    setOpen(j);
  };
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="rounded-lg border bg-[var(--c-bg-subtle)]">
          <div className="flex items-center gap-2 px-3 py-2">
            <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm font-medium" onClick={() => setOpen(open === i ? null : i)}>
              <ChevronDown className={cn("size-4 transition-transform", open !== i && "-rotate-90")} />
              {titleOf(item, i)}
            </button>
            {!ctx.lockNeutral && (
              <div className="flex">
                <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => move(i, -1)} aria-label={t("moveUp")}><ChevronUp /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => move(i, 1)} aria-label={t("moveDown")}><ChevronDown /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={t("remove")}><Trash2 /></Button>
              </div>
            )}
          </div>
          {open === i && (
            <div className="border-t bg-card p-3">
              <JsonFields value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} ctx={ctx} />
            </div>
          )}
        </div>
      ))}
      {!ctx.lockNeutral && value.length > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={() => { onChange([...value, blankLike(value[0])]); setOpen(value.length); }}>
          <Plus /> {t("addItem")}
        </Button>
      )}
    </div>
  );
}

/** Trình sửa JSON tự dựng theo cấu trúc dữ liệu: chuỗi -> ô nhập, ảnh -> ô tải ảnh, mảng -> danh sách, object -> nhóm trường */
export function JsonFields({ value, onChange, ctx, fieldKey }: { value: Json; onChange: (v: Json) => void; ctx: Ctx; fieldKey?: string }) {
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) {
      return <StringList value={value as string[]} onChange={onChange} disabled={ctx.lockNeutral && NEUTRAL_KEYS.has(fieldKey ?? "")} />;
    }
    return <ObjectList value={value} onChange={onChange} ctx={ctx} />;
  }

  if (isObject(value)) {
    const entries = Object.entries(value);
    return (
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {entries.map(([key, v]) => {
          const neutral = NEUTRAL_KEYS.has(key);
          const locked = ctx.lockNeutral && neutral;
          const wide = isObject(v) || Array.isArray(v) || (typeof v === "string" && (LONG_TEXT.test(key) || v.length > 80)) || IMAGE_KEYS.has(key);
          const set = (next: Json) => onChange({ ...value, [key]: next });
          return (
            <div key={key} className={cn("space-y-1.5", wide && "sm:col-span-2")}>
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--c-text-2)]">
                {ctx.label(key)}
                {locked && <span className="rounded bg-[var(--c-bg-muted)] px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">VI</span>}
              </label>
              {isObject(v) ? (
                <div className="rounded-lg border p-3"><JsonFields value={v} onChange={set} ctx={ctx} /></div>
              ) : Array.isArray(v) ? (
                <JsonFields value={v} onChange={set} ctx={ctx} fieldKey={key} />
              ) : IMAGE_KEYS.has(key) ? (
                <ImageInput value={String(v ?? "")} onChange={set} upload={ctx.upload} disabled={locked} />
              ) : typeof v === "boolean" ? (
                <input type="checkbox" checked={v} disabled={locked} onChange={(e) => set(e.target.checked)} className="size-4" />
              ) : typeof v === "string" && (LONG_TEXT.test(key) || v.length > 80) ? (
                <Textarea rows={3} value={v} disabled={locked} onChange={(e) => set(e.target.value)} />
              ) : (
                <Input value={String(v ?? "")} disabled={locked} onChange={(e) => set(typeof v === "number" ? Number(e.target.value) : e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export const humanizeKey = humanize;
