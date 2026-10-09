"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useIsFetching, useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DetailAttachmentsTab } from "@/components/common/AttachmentManager";
import { StatusPage } from "@/components/common/StatusPage/StatusPage";
import { useConfirm } from "@/components/feedback/confirm";
import { formatRelative, parseDateTime, formatDateTime } from "@/components/list/renderers";
import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { http } from "@/lib/api/axiosClient";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import type { Paginated } from "@/lib/api/types";
import { EntityAuditTab } from "./EntityAuditTab";
import { listReturnKey } from "@/components/list/ListPage";

const MAX_FIELDS = 8;

export interface HeroField {
  label: string;
  value: React.ReactNode;
  /** Chiếm cả hàng (ghi chú dài) */
  wide?: boolean;
}

export interface HeroConfig {
  title: string;
  image?: string | null;
  /** Chữ viết tắt khi không có ảnh (mặc định lấy từ title) */
  initials?: string;
  /** Tối đa 2 badge (trạng thái, vai trò…) */
  badges?: React.ReactNode[];
  /** Mã bản ghi, hiển thị monospace cạnh badge */
  code?: string;
  /** 2–3 thông tin nhận diện, nối bằng "·" */
  subtitle?: React.ReactNode[];
  updatedAt?: string | null;
  updatedBy?: string | null;
  fields: HeroField[];
}

export interface DetailAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  /** Không có handler (không có quyền) -> mục bị bỏ */
  onClick?: () => Promise<unknown> | void;
  confirm?: { title: string; content?: string; okText?: string };
  disabledReason?: string | null;
}

export interface DetailTab {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

export interface DetailPageProps<T> {
  query: { data?: T; isLoading: boolean; isError: boolean };
  backHref: string;
  /** Tên thực thể viết thường, vd. "nguyên vật liệu" */
  entityLabel: string;
  hero: (entity: T) => HeroConfig;
  onEdit?: () => void;
  editLabel?: string;
  moreActions?: (entity: T) => DetailAction[];
  tabs?: (entity: T) => DetailTab[];
  /** Tab "Tệp đính kèm" chuẩn */
  attachments?: { entityType: string; entityId: number; readonly: boolean };
  /** Tab "Nhật ký" chuẩn (tự ẩn khi thiếu AUDIT_LOGS_READ) */
  audit?: { model: string; objectId: number };
  children?: React.ReactNode;
}

/** Query dùng chung của khung ứng dụng (menu, thông báo, cấu hình…) — nút Làm mới của trang chi tiết không tải lại */
const GLOBAL_QUERY_ROOTS = new Set(["navigation", "notifications", "system-health"]);
const isPageQuery = (q: Query) =>
  !GLOBAL_QUERY_ROOTS.has(String(q.queryKey[0])) && !(q.queryKey[0] === "system-settings" && q.queryKey[1] === "public");

function initialsOf(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : title.slice(0, 2)).toUpperCase();
}

function AttachmentCount({ entityType, entityId }: { entityType: string; entityId: number }) {
  const { data } = useQuery({
    queryKey: ["attachments", entityType, entityId, "count"],
    queryFn: () => http.get<Paginated<unknown>>("/attachments/", { params: { entity_type: entityType, entity_id: entityId, page_size: 1 } }),
    staleTime: 60_000,
  });
  return data?.count ? <span className="detail-tabs__count">{data.count}</span> : null;
}

/**
 * Khung trang chi tiết chuẩn: Hero 2 tầng (nhận diện + lưới thuộc tính) → Tabs (?tab= trên URL).
 * Tab "Tệp đính kèm" / "Nhật ký", breadcrumb, Skeleton, 404 do khung tự lo.
 */
export function DetailPage<T>({ query, backHref, entityLabel, hero, onEdit, editLabel, moreActions, tabs, attachments, audit, children }: DetailPageProps<T>) {
  const t = useTranslations("detail");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { can } = usePermission();
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const refreshing = useIsFetching({ type: "active", predicate: isPageQuery }) > 0;
  // Làm mới toàn trang: mọi API đang hiển thị (bản ghi, tab đang mở, đếm tệp đính kèm, nhật ký…)
  const refresh = () => queryClient.refetchQueries({ type: "active", predicate: isPageQuery });
  const config = query.data ? hero(query.data) : null;
  useBreadcrumbTitle(config?.title);

  // Quay lại: về đúng URL danh sách gần nhất (giữ bộ lọc, trang, sắp xếp) do ListPage ghi nhớ
  const goBack = () => {
    let target = backHref;
    try {
      target = sessionStorage.getItem(listReturnKey(backHref)) ?? backHref;
    } catch {
      // sessionStorage bị chặn → dùng URL gốc
    }
    router.push(target);
  };

  if (query.isLoading) {
    return (
      <div className="detail-page">
        <div className="detail-hero space-y-4">
          <div className="flex gap-4">
            <Skeleton className="size-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data || !config) {
    return (
      <StatusPage
        status="404"
        title={t("notFound", { entity: entityLabel })}
        subTitle={t("notFoundHint")}
        extra={
          <Button onClick={() => router.push(backHref)}>
            <ArrowLeft />
            {t("backToList")}
          </Button>
        }
      />
    );
  }

  const entity = query.data;
  const actions = (moreActions?.(entity) ?? []).filter((a) => a.onClick);
  const safe = actions.filter((a) => !a.danger);
  const danger = actions.filter((a) => a.danger);
  const runAction = async (a: DetailAction) => {
    const exec = async () => {
      try {
        await a.onClick?.();
      } catch (error) {
        toast.error(extractErrorMessage(error, t("actionFailed")));
        throw error;
      }
    };
    if (a.confirm) {
      await confirm({ title: a.confirm.title, description: a.confirm.content, confirmText: a.confirm.okText ?? tc("actions.confirm"), danger: a.danger, onConfirm: exec });
    } else exec().catch(() => undefined);
  };
  const menuItem = (a: DetailAction) => {
    const item = (
      <DropdownMenuItem key={a.key} disabled={Boolean(a.disabledReason)} variant={a.danger ? "destructive" : "default"} onSelect={() => runAction(a)}>
        {a.icon}
        {a.label}
      </DropdownMenuItem>
    );
    return a.disabledReason ? (
      <Tooltip key={a.key}>
        <TooltipTrigger asChild>
          <div>{item}</div>
        </TooltipTrigger>
        <TooltipContent side="left">{a.disabledReason}</TooltipContent>
      </Tooltip>
    ) : (
      item
    );
  };

  const allTabs: DetailTab[] = [
    ...(tabs?.(entity) ?? []),
    ...(attachments
      ? [
          {
            key: "attachments",
            label: (
              <span className="inline-flex items-center">
                {t("tabs.attachments")} <AttachmentCount entityType={attachments.entityType} entityId={attachments.entityId} />
              </span>
            ),
            children: <DetailAttachmentsTab entityType={attachments.entityType} entityId={attachments.entityId} entityName={config.title} maxFileSizeMB={25} readonly={attachments.readonly} />,
          },
        ]
      : []),
    ...(audit && can(PERMISSIONS.AUDIT_LOGS.READ) ? [{ key: "audit", label: t("tabs.audit"), children: <EntityAuditTab model={audit.model} objectId={audit.objectId} /> }] : []),
  ];
  const tabParam = searchParams.get("tab");
  const activeTab = allTabs.some((t) => t.key === tabParam) ? (tabParam as string) : allTabs[0]?.key;
  const setTab = (key: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (key === allTabs[0]?.key) sp.delete("tab");
    else sp.set("tab", key);
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const updated = parseDateTime(config.updatedAt ?? null);
  // Trường chiếm cả hàng (ghi chú) rỗng thì bỏ, không chiếm chỗ
  const shownFields = config.fields.filter((f) => !(f.wide && (f.value === null || f.value === undefined || f.value === "")));
  const fields = expanded ? shownFields : shownFields.slice(0, MAX_FIELDS);

  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="detail-hero__top">
          <div className="detail-hero__media">
            {config.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.image} alt={config.title} />
            ) : (
              <span>{config.initials ?? initialsOf(config.title)}</span>
            )}
          </div>
          <div className="detail-hero__identity">
            <div className="detail-hero__title-row">
              <h1 className="detail-hero__title">{config.title}</h1>
              {config.badges?.slice(0, 2)}
              {config.code && <span className="list-code">{config.code}</span>}
            </div>
            <div className="detail-hero__subtitle">
              {[...(config.subtitle ?? []), updated ? (config.updatedBy ? t("updatedBy", { time: formatRelative(updated, new Date(), locale), user: config.updatedBy }) : t("updated", { time: formatRelative(updated, new Date(), locale) })) : null]
                .filter(Boolean)
                .map((part, i) => (
                  <span key={i} title={i === (config.subtitle?.length ?? 0) && updated ? formatDateTime(updated) : undefined}>
                    {part}
                  </span>
                ))}
            </div>
          </div>
          <div className="detail-hero__actions">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft />
              {tc("actions.back")}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={refresh} aria-label={tc("actions.refresh")}>
                  <RefreshCw className={refreshing ? "animate-spin" : undefined} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tc("actions.refresh")}</TooltipContent>
            </Tooltip>
            {onEdit && (
              <Button onClick={onEdit}>
                <Pencil />
                {editLabel ?? t("edit")}
              </Button>
            )}
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={tc("actions.more")}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  {safe.map(menuItem)}
                  {safe.length > 0 && danger.length > 0 && <DropdownMenuSeparator />}
                  {danger.map(menuItem)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {shownFields.length > 0 && (
          <dl className="detail-hero__fields">
            {fields.map((f) => (
              <div key={f.label} className={`detail-field${f.wide ? " detail-field--wide" : ""}`}>
                <dt>{f.label}</dt>
                <dd>{f.value === null || f.value === undefined || f.value === "" ? <span className="list-empty-value">—</span> : f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {shownFields.length > MAX_FIELDS && (
          <Button variant="link" size="sm" onClick={() => setExpanded((v) => !v)} className="detail-hero__more">
            {expanded ? t("collapse") : t("showMore", { count: shownFields.length - MAX_FIELDS })}
          </Button>
        )}
      </section>

      {allTabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={setTab} className="detail-tabs gap-4">
          <TabsList variant="line" className="h-auto w-full justify-start gap-4 rounded-none border-b p-0">
            {allTabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="flex-none px-0.5 py-2">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {allTabs.map((t) => (
            <TabsContent key={t.key} value={t.key}>
              {t.children}
            </TabsContent>
          ))}
        </Tabs>
      )}
      {children}
    </div>
  );
}
