"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Star, Trash2 } from "lucide-react";
import { ACTIVE_STATUS, StatusBadge } from "@/components/common/StatusBadge";
import { useConfirm } from "@/components/feedback/confirm";
import { Button } from "@/components/ui/button";

export interface ContentCardItem {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
  image?: string | null;
  isActive?: boolean;
  featured?: boolean;
  tags?: string[];
}

interface ContentGridProps {
  items: ContentCardItem[];
  /** Đường dẫn trang soạn của một bản ghi */
  editHref: (id: number) => string;
  canEdit?: boolean;
  onDelete?: (item: ContentCardItem) => Promise<unknown>;
  entityLabel: string;
  featuredLabel?: string;
}

/** Lưới thẻ cho danh sách nội dung (Dự án, Bài viết): ảnh lớn, tiêu đề, trạng thái, thao tác nhanh. */
export function ContentGrid({ items, editHref, canEdit, onDelete, entityLabel, featuredLabel }: ContentGridProps) {
  const tc = useTranslations("common");
  const confirm = useConfirm();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
          <Link href={editHref(item.id)} className="relative block aspect-[16/10] overflow-hidden bg-[var(--c-bg-muted)]" tabIndex={-1}>
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh từ API / thư mục public
              <img src={item.image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">{item.title.slice(0, 1)}</div>
            )}
            <div className="absolute left-3 top-3 flex gap-1.5">
              {item.isActive !== undefined && (
                <span className="rounded-full bg-background/90 shadow-sm backdrop-blur">
                  <StatusBadge map={ACTIVE_STATUS} value={item.isActive} />
                </span>
              )}
              {item.featured && featuredLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
                  <Star className="size-3" /> {featuredLabel}
                </span>
              )}
            </div>
          </Link>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <Link href={editHref(item.id)} className="line-clamp-2 font-semibold text-foreground hover:text-[var(--c-primary)]">
              {item.title}
            </Link>
            {item.subtitle && <p className="line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded bg-[var(--c-bg-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--c-text-2)]">{tag}</span>
                ))}
              </div>
            )}
            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <span className="truncate text-xs text-muted-foreground">{item.meta}</span>
              <div className="flex gap-1">
                {canEdit && (
                  <Button variant="ghost" size="icon" asChild aria-label={tc("actions.edit")}>
                    <Link href={editHref(item.id)}><Pencil /></Link>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={tc("actions.delete")}
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      confirm({
                        title: tc("messages.deleteTitle", { entity: entityLabel, name: item.title }),
                        description: tc("messages.deleteIrreversible"),
                        confirmText: tc("actions.delete"),
                        danger: true,
                        onConfirm: () => onDelete(item),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
