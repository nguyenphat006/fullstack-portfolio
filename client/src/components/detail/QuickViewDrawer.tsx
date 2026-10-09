"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { HeroConfig } from "./DetailPage";

export interface QuickViewConfig<T> {
  /** Hook chi tiết của module (chỉ gọi API khi id khác 0) */
  useDetail: (id: number) => { data?: T; isLoading: boolean; isError: boolean };
  /** Dùng lại cấu hình Hero của trang chi tiết */
  hero: (entity: T) => HeroConfig;
  href: (id: number) => string;
}

function isEmpty(v: unknown) {
  return v === null || v === undefined || v === "";
}

function QuickViewBody<T>({ id, config }: { id: number; config: QuickViewConfig<T> }) {
  const t = useTranslations("detail");
  const { data, isLoading, isError } = config.useDetail(id);
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (isError || !data) return <p className="p-4 text-sm text-muted-foreground">{t("quickView.loadError")}</p>;
  const hero = config.hero(data);
  return (
    <div className="quick-view px-4 pb-4">
      <div className="quick-view__head">
        <div className="detail-hero__media">
          {hero.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.image} alt={hero.title} />
          ) : (
            <span>{hero.initials ?? hero.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="detail-hero__identity">
          <span className="quick-view__title">{hero.title}</span>
          <div className="detail-hero__title-row">
            {hero.badges?.slice(0, 2)}
            {hero.code && <span className="list-code">{hero.code}</span>}
          </div>
          {hero.subtitle && hero.subtitle.length > 0 && (
            <div className="detail-hero__subtitle">
              {hero.subtitle.filter(Boolean).map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <dl className="quick-view__fields">
        {hero.fields
          .filter((f) => !(f.wide && isEmpty(f.value)))
          .map((f) => (
            <div key={f.label} className="detail-field">
              <dt>{f.label}</dt>
              <dd>{isEmpty(f.value) ? <span className="list-empty-value">—</span> : f.value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

/** Ngăn xem nhanh bên phải: thuộc tính chính + nút mở trang chi tiết, không rời danh sách. */
export function QuickViewDrawer<T>({ id, onClose, config }: { id: number | null; onClose: () => void; config: QuickViewConfig<T> }) {
  const t = useTranslations("detail");
  return (
    <Sheet open={id !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-[480px]">
        <SheetHeader className="border-b">
          <SheetTitle>{t("quickView.title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("quickView.description")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pt-4">{id !== null && <QuickViewBody id={id} config={config} />}</div>
        {id !== null && (
          <div className="border-t p-4">
            <Button asChild className="w-full">
              <Link href={config.href(id)}>
                {t("quickView.openDetail")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
