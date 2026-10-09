"use client";

import React, { useMemo, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { Folder, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/components/feedback/confirm";
import { ACTIVE_STATUS, StatusBadge } from "@/components/common/StatusBadge";
import { getIconByName } from "@/constants/iconMap";
import { getActionTone, sortPermissionsByAction } from "@/constants/permissionTags";
import { cn } from "@/lib/utils";
import type { ModuleRegistryItem } from "../types";
import { sortHierarchicalList } from "./module-table/sortHierarchicalList";

interface ModuleTableProps {
  data: ModuleRegistryItem[];
  loading: boolean;
  /** Handler không truyền = không có quyền -> ẩn nút tương ứng */
  onEdit?: (module: ModuleRegistryItem) => void;
  onDelete?: (id: number) => void;
  onAddAction?: (module: ModuleRegistryItem) => void;
  onRemoveAction?: (moduleId: number, permissionId: number) => void;
  /** Không truyền = không kéo thả được (ẩn cột kéo) */
  onReorder?: (orderedIds: number[]) => void;
}

interface RowProps extends Omit<ModuleTableProps, "data" | "loading" | "onReorder"> {
  item: ModuleRegistryItem;
  draggable: boolean;
}

function PermissionsCell({ item, onAddAction, onRemoveAction }: Pick<RowProps, "item" | "onAddAction" | "onRemoveAction">) {
  const t = useTranslations("settings.modules");
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const perms = sortPermissionsByAction(item.permissions ?? []);
  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="xs" className="tabular-nums">
            {t("permissionCount", { count: perms.length })}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[360px] p-0">
          <p className="border-b px-3 py-2 text-sm font-medium">{t("permissionsOf", { name: item.module_name })}</p>
          {perms.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{t("noPermissions")}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {perms.map((p) => (
                <li key={p.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                  <StatusBadge tone={getActionTone(p.permission_code)} label={<span className="font-mono">{p.permission_code}</span>} />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{p.permission_name}</span>
                  {onRemoveAction && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive"
                      aria-label={t("removePermission", { code: p.permission_code })}
                      onClick={() =>
                        confirm({
                          title: t("removePermissionTitle", { code: p.permission_code }),
                          description: t("removePermissionHint"),
                          confirmText: tc("actions.delete"),
                          danger: true,
                          onConfirm: () => onRemoveAction(item.id, p.id),
                        })
                      }
                    >
                      <X />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
      {onAddAction && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label={t("addPermission")} onClick={() => onAddAction(item)}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("addPermission")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function ModuleRow({ item, draggable, onEdit, onDelete, onAddAction, onRemoveAction }: RowProps) {
  const t = useTranslations("settings.modules");
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id), disabled: !draggable });
  const isChild = Boolean(item.parent_code);
  const isGroup = !item.parent_code && !item.route_path;

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("dt-row", isDragging && "relative z-10 shadow-lg [&>td]:bg-[var(--c-primary-bg)]")}
      {...attributes}
    >
      {draggable && (
        <td className="dt-td w-10 text-center">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...listeners}
            className="inline-flex size-7 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
            aria-label={t("dragToReorder", { name: item.module_name })}
          >
            <GripVertical className="size-4" />
          </button>
        </td>
      )}
      <td className="dt-td">
        <div className={cn("flex min-w-0 items-center gap-2.5", isChild && "pl-7")}>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md border [&_svg]:size-4",
              isGroup ? "border-transparent bg-[var(--c-primary-bg)] text-[var(--c-primary)]" : "bg-[var(--c-bg-subtle)] text-muted-foreground",
            )}
          >
            {item.icon ? getIconByName(item.icon) : <Folder />}
          </span>
          <span className="min-w-0">
            <span className={cn("block truncate", isGroup ? "font-semibold" : "font-medium")}>{item.module_name}</span>
            {item.description && <span className="block truncate text-xs text-muted-foreground">{item.description}</span>}
          </span>
        </div>
      </td>
      <td className="dt-td">
        <span className="font-mono text-xs">{item.module_code}</span>
      </td>
      <td className="dt-td">{item.route_path ? <span className="font-mono text-xs">{item.route_path}</span> : <span className="text-xs text-muted-foreground">{t("menuGroup")}</span>}</td>
      <td className="dt-td">
        <StatusBadge tone={item.is_navigation ? "info" : "neutral"} label={item.is_navigation ? t("navShown") : t("navHidden")} />
      </td>
      <td className="dt-td">
        <PermissionsCell item={item} onAddAction={onAddAction} onRemoveAction={onRemoveAction} />
      </td>
      <td className="dt-td">
        <StatusBadge map={ACTIVE_STATUS} value={item.is_active} />
      </td>
      {(onEdit || onDelete) && (
        <td className="dt-td dt-actions text-right">
          <div className="inline-flex gap-0.5">
            {onEdit && (
              <Button variant="ghost" size="icon-sm" aria-label={tc("actions.edit")} onClick={() => onEdit(item)}>
                <Pencil />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                aria-label={tc("actions.delete")}
                onClick={() =>
                  confirm({
                    title: t("deleteTitle", { name: item.module_name }),
                    description: t("deleteHint"),
                    confirmText: tc("actions.delete"),
                    danger: true,
                    onConfirm: () => onDelete(item.id),
                  })
                }
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

/** Bảng cây phân hệ (cha → con thụt lề); kéo thả tay nắm để đổi thứ tự menu */
export function ModuleTable({ data, loading, onEdit, onDelete, onAddAction, onRemoveAction, onReorder }: ModuleTableProps) {
  // Thứ tự tạm khi kéo thả; dữ liệu server đổi -> sắp lại (cập nhật trong render, không qua effect)
  const [source, setSource] = useState(data);
  const [rows, setRows] = useState(() => sortHierarchicalList(data));
  if (source !== data) {
    setSource(data);
    setRows(sortHierarchicalList(data));
  }

  const t = useTranslations("settings.modules");
  const tc = useTranslations("common");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = useMemo(() => rows.map((r) => String(r.id)), [rows]);
  const draggable = Boolean(onReorder);
  const hasActions = Boolean(onEdit || onDelete);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => String(r.id) === active.id);
    const to = rows.findIndex((r) => String(r.id) === over.id);
    if (from < 0 || to < 0) return;
    const next = arrayMove(rows, from, to);
    setRows(next);
    onReorder?.(next.map((r) => r.id));
  };

  return (
    <div className="dt-scroll">
      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <table className="dt w-full min-w-[960px]">
          <thead>
            <tr>
              {draggable && <th className="dt-th w-10" aria-label={t("dragColumn")} />}
              <th className="dt-th">{t("columns.module")}</th>
              <th className="dt-th w-44">{tc("fields.code")}</th>
              <th className="dt-th w-48">{t("columns.route")}</th>
              <th className="dt-th w-24">{t("columns.menu")}</th>
              <th className="dt-th w-32">{t("columns.permissions")}</th>
              <th className="dt-th w-32">{tc("fields.status")}</th>
              {hasActions && <th className="dt-th w-24" aria-label={tc("fields.actions")} />}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td className="dt-td" colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : (
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {rows.map((item) => (
                  <ModuleRow key={item.id} item={item} draggable={draggable} onEdit={onEdit} onDelete={onDelete} onAddAction={onAddAction} onRemoveAction={onRemoveAction} />
                ))}
              </SortableContext>
            )}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}

export default ModuleTable;
