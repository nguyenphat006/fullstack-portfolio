"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { QuickViewDrawer, type QuickViewConfig } from "@/components/detail/QuickViewDrawer";
import { useConfirm } from "@/components/feedback/confirm";
import { useModuleHeader } from "@/hooks/useModuleHeader";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import type { Paginated } from "@/lib/api/types";
import { BulkActionBar, type BulkAction } from "./BulkActionBar";
import { resolveColumns } from "./columnLayout";
import { FilterBar } from "./FilterBar";
import { ListTable } from "./ListTable";
import { TableSettings } from "./TableSettings";
import { useListPreferences } from "./useListPreferences";
import type { ListState } from "./useListState";
import type { ListColumn } from "./types";

/** Mục phụ trong menu ⋯ của dòng (đã lọc theo quyền) */
export interface RowMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

export interface RowActions<T> {
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => Promise<unknown> | void;
  /** Tiêu đề hộp xác nhận xóa */
  deleteTitle?: (record: T) => string;
  /** Lý do không cho sửa dòng này -> nút sửa bị khóa kèm Tooltip */
  editDisabledReason?: (record: T) => string | null;
  /** Lý do không cho xóa (vd. tài khoản quản trị) -> nút xóa + ô chọn bị khóa, hiện Tooltip */
  protectedReason?: (record: T) => string | null;
  more?: (record: T) => RowMenuItem[];
}

export interface ListQuery<T> {
  data?: Paginated<T>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => unknown;
}

export interface ListPageProps<T> {
  /** Mã phân hệ (ModuleRegistries) -> tiêu đề + mô tả trang */
  moduleCode: string;
  tableKey: string;
  list: ListState;
  query: ListQuery<T>;
  columns: ListColumn<T>[];
  /** Tên thực thể viết thường, vd. "đơn vị tính" (dùng cho nút / trạng thái rỗng) */
  entityLabel: string;
  rowKey?: string;
  searchPlaceholder?: string;
  onCreate?: () => void;
  createLabel?: string;
  rowActions?: RowActions<T>;
  bulkActions?: BulkAction[];
  onExport?: (selectedIds: number[]) => void;
  onImport?: () => void;
  /** "Xem nhanh" trong menu ⋯ của dòng: ngăn phải dùng lại Hero của trang chi tiết */
  quickView?: QuickViewConfig<T>;
  /** Modal / Drawer của module */
  children?: React.ReactNode;
}

function IconAction({ label, onClick, disabled, danger, children }: { label: string; onClick?: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* span giữ Tooltip khi nút bị khóa */}
        <span>
          <Button variant="ghost" size="icon-sm" aria-label={label} disabled={disabled} onClick={onClick} className={danger ? "text-destructive hover:text-destructive" : "text-muted-foreground"}>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Khung trang danh sách chuẩn: PageHeader (1 nút chính) → thanh lọc → tag bộ lọc → bảng → thanh hàng loạt.
 * Module chỉ khai báo cột, bộ lọc, quyền (truyền handler khi có quyền). Xem docs/plan/ui-list-detail-design.md.
 */
/** Khóa sessionStorage lưu URL danh sách gần nhất (bộ lọc, trang, sắp xếp) — nút "Quay lại" của trang chi tiết đọc lại */
export const listReturnKey = (pathname: string) => `erp:list-return:${pathname}`;

export function ListPage<T extends object>({
  moduleCode,
  tableKey,
  list,
  query,
  columns,
  entityLabel,
  rowKey = "id",
  searchPlaceholder,
  onCreate,
  createLabel,
  rowActions,
  bulkActions = [],
  onExport,
  onImport,
  quickView,
  children,
}: ListPageProps<T>) {
  const t = useTranslations("list");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const qs = searchParams.toString();
      sessionStorage.setItem(listReturnKey(pathname), qs ? `${pathname}?${qs}` : pathname);
    } catch {
      // sessionStorage bị chặn (chế độ riêng tư) → Quay lại dùng URL gốc của danh sách
    }
  }, [pathname, searchParams]);
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const { title, subtitle } = useModuleHeader(moduleCode);
  const prefsApi = useListPreferences(tableKey);
  const resolved = useMemo(() => resolveColumns(columns, prefsApi.prefs), [columns, prefsApi.prefs]);

  // Lựa chọn gắn với bộ tham số hiện tại -> đổi trang / lọc là tự bỏ chọn
  const paramsKey = JSON.stringify(list.params);
  const [selection, setSelection] = useState<{ key: string; ids: React.Key[] }>({ key: paramsKey, ids: [] });
  const selectedIds = selection.key === paramsKey ? selection.ids : [];
  const setSelectedIds = (ids: React.Key[]) => setSelection({ key: paramsKey, ids });
  const [busy, setBusy] = useState(false);
  const [quickId, setQuickId] = useState<number | null>(null);

  const runBulk = async (action: BulkAction) => {
    const ids = selectedIds.map(Number);
    const exec = async () => {
      setBusy(true);
      try {
        await action.onClick(ids);
        setSelectedIds([]);
      } catch (error) {
        toast.error(extractErrorMessage(error, t("page.actionFailed")));
        throw error;
      } finally {
        setBusy(false);
      }
    };
    if (action.confirm) {
      await confirm({
        title: typeof action.confirm.title === "function" ? action.confirm.title(ids.length) : action.confirm.title,
        description: action.confirm.content,
        confirmText: action.confirm.okText ?? tc("actions.confirm"),
        danger: action.danger,
        onConfirm: exec,
      });
    } else exec().catch(() => undefined);
  };

  const askDelete = (record: T) =>
    confirm({
      title: rowActions?.deleteTitle?.(record) ?? t("page.deleteTitle", { entity: entityLabel }),
      description: tc("messages.deleteIrreversible"),
      confirmText: tc("actions.delete"),
      danger: true,
      onConfirm: async () => {
        try {
          await rowActions?.onDelete?.(record);
        } catch (error) {
          toast.error(extractErrorMessage(error, t("page.deleteFailed", { entity: entityLabel })));
          throw error;
        }
      },
    });

  const hasRowActions = Boolean(quickView || (rowActions && (rowActions.onEdit || rowActions.onDelete || rowActions.more)));
  const actions = hasRowActions
    ? {
        width: 112,
        render: (record: T) => {
          const reason = rowActions?.protectedReason?.(record) ?? null;
          const editReason = rowActions?.editDisabledReason?.(record) ?? null;
          const more: RowMenuItem[] = [
            ...(quickView ? [{ key: "__quick", label: "Xem nhanh", icon: <Eye />, onClick: () => setQuickId((record as Record<string, unknown>)[rowKey] as number) }] : []),
            ...(rowActions?.more?.(record) ?? []),
          ];
          return (
            <div className="list-row-actions">
              {rowActions?.onEdit && (
                <IconAction label={editReason ?? tc("actions.edit")} disabled={Boolean(editReason)} onClick={() => rowActions.onEdit?.(record)}>
                  <Pencil />
                </IconAction>
              )}
              {rowActions?.onDelete && (
                <IconAction label={reason ?? tc("actions.delete")} disabled={Boolean(reason)} danger={!reason} onClick={() => askDelete(record)}>
                  <Trash2 />
                </IconAction>
              )}
              {more.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={tc("actions.more")} className="text-muted-foreground">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {more.map((item) => (
                      <DropdownMenuItem key={item.key} disabled={item.disabled} variant={item.danger ? "destructive" : "default"} onSelect={item.onClick}>
                        {item.icon}
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
      }
    : undefined;

  const empty = query.isError ? (
    <EmptyState title={tc("messages.loadError")} description={t("page.loadErrorHint")} actionText={tc("actions.retry")} onAction={() => query.refetch()} actionType="default" icon={null} />
  ) : list.hasFilters ? (
    <EmptyState title={t("page.noResults")} description={t("page.noResultsHint")} actionText={tc("actions.clear")} onAction={list.clearFilters} actionType="default" icon={null} />
  ) : (
    <EmptyState title={t("page.empty", { entity: entityLabel })} actionText={onCreate ? createLabel ?? t("page.create", { entity: entityLabel }) : undefined} onAction={onCreate} />
  );

  return (
    <div className="list-page">
      <PageHeader
        title={title}
        subtitle={subtitle}
        extra={
          onCreate && (
            <Button onClick={onCreate} aria-label={createLabel ?? t("page.create", { entity: entityLabel })}>
              <Plus />
              <span className="list-page__create-text">{createLabel ?? t("page.create", { entity: entityLabel })}</span>
            </Button>
          )
        }
      />

      {/* Thanh công cụ + bảng chung một khối nền */}
      <div className="list-card">
        <FilterBar
          list={list}
          columns={columns}
          searchPlaceholder={searchPlaceholder ?? t("page.searchPlaceholder")}
          onRefresh={() => query.refetch()}
          refreshing={query.isFetching && !query.isLoading}
          onExport={onExport ? () => onExport(selectedIds.map(Number)) : undefined}
          onImport={onImport}
          settings={<TableSettings resolved={resolved} prefsApi={prefsApi} />}
        />
        <ListTable<T>
          resolved={resolved}
          prefsApi={prefsApi}
          list={list}
          data={query.data?.results}
          total={query.data?.count ?? 0}
          loading={query.isLoading}
          fetching={query.isFetching}
          rowKey={rowKey}
          selection={
            bulkActions.length
              ? { selectedKeys: selectedIds, onChange: setSelectedIds, isDisabled: (r) => Boolean(rowActions?.protectedReason?.(r)) }
              : undefined
          }
          actions={actions}
          empty={empty}
        />
      </div>

      {quickView && <QuickViewDrawer id={quickId} onClose={() => setQuickId(null)} config={quickView} />}
      <BulkActionBar count={selectedIds.length} actions={bulkActions} onRun={runBulk} onClear={() => setSelectedIds([])} busy={busy} />
      {children}
    </div>
  );
}

export type { BulkAction };
