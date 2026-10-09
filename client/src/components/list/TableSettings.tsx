"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { GripVertical, Pin, Settings2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResolvedColumns } from "./columnLayout";
import type { ListColumn } from "./types";
import type { ListPreferencesApi, PinSide, TableDensity } from "./useListPreferences";

const DENSITY_OPTIONS: { label: "large" | "middle" | "small"; value: TableDensity }[] = [
  { label: "large", value: "large" },
  { label: "middle", value: "middle" },
  { label: "small", value: "small" },
];

interface RowProps {
  title: string;
  visible: boolean;
  hideable: boolean;
  pin: PinSide;
  onToggle?: (visible: boolean) => void;
  onPin?: (side: PinSide) => void;
}

/** Nội dung một dòng cột (dùng cho dòng trong danh sách lẫn bản xem trước khi kéo) */
function RowContent({ title, visible, hideable, pin, onToggle, onPin, grip }: RowProps & { grip?: React.ReactNode }) {
  const t = useTranslations("list");
  const pinButton = (side: "left" | "right") => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={pin === side ? t("column.unpin") : side === "left" ? t("column.pinLeft") : t("column.pinRight")}
          className={cn(pin === side && "text-primary")}
          onClick={() => onPin?.(pin === side ? false : side)}
        >
          <Pin className={cn(side === "right" && "rotate-90", pin === side && "fill-current")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{pin === side ? t("column.unpin") : side === "left" ? t("column.pinLeft") : t("column.pinRight")}</TooltipContent>
    </Tooltip>
  );
  return (
    <>
      {grip ?? <GripVertical className="table-settings__grip size-4" />}
      <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <Checkbox checked={visible} disabled={!hideable} onCheckedChange={(c) => onToggle?.(c === true)} />
        <span className="truncate">{title}</span>
      </label>
      {pinButton("left")}
      {pinButton("right")}
    </>
  );
}

function SortableRow({ id, ...props }: RowProps & { id: string }) {
  const t = useTranslations("list");
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("table-settings__row", isDragging && "is-placeholder")}
    >
      <RowContent
        {...props}
        grip={
          <button type="button" ref={setActivatorNodeRef} className="table-settings__handle" aria-label={t("settings.dragHint")} {...attributes} {...listeners}>
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  );
}

/** Nút ⚙: hiện / ẩn cột, kéo thả đổi thứ tự (dnd-kit, có bản xem trước), ghim, mật độ, khôi phục mặc định. */
export function TableSettings<T>({ resolved, prefsApi }: { resolved: ResolvedColumns<T>; prefsApi: ListPreferencesApi }) {
  const t = useTranslations("list");
  const { prefs, update, reset, isCustomized } = prefsApi;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byKey = new Map(resolved.ordered.map((c) => [c.key, c]));
  const rowProps = (col: ListColumn<T>): RowProps => ({
    title: col.title,
    visible: resolved.isVisible(col),
    hideable: col.hideable !== false,
    pin: resolved.pinOf(col),
    onToggle: (v) => update((p) => ({ visibility: { ...p.visibility, [col.key]: v } })),
    onPin: (side) => update((p) => ({ pinned: { ...p.pinned, [col.key]: side } })),
  });

  const onDragStart = (e: DragStartEvent) => setActiveKey(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveKey(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const keys = resolved.orderKeys;
    update({ order: arrayMove(keys, keys.indexOf(String(active.id)), keys.indexOf(String(over.id))) });
  };
  const activeCol = activeKey ? byKey.get(activeKey) : undefined;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t("settings.title")} className={cn(isCustomized && "border-primary text-primary")}>
              <Settings2 />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("settings.title")}</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="table-settings w-80 p-3">
        <div className="table-settings__head">
          <span>{t("settings.visibleColumns")}</span>
          {isCustomized && (
            <Button variant="link" size="xs" className="h-auto p-0" onClick={reset}>
              {t("settings.resetDefault")}
            </Button>
          )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveKey(null)}
        >
          <SortableContext items={resolved.orderKeys} strategy={verticalListSortingStrategy}>
            <div className="table-settings__list">
              {resolved.ordered.map((col) => (
                <SortableRow key={col.key} id={col.key} {...rowProps(col)} />
              ))}
            </div>
          </SortableContext>
          {/* Bản xem trước dòng đang kéo; portal ra body vì popover có transform làm lệch vị trí fixed */}
          {typeof document !== "undefined" &&
            createPortal(
              <DragOverlay>{activeCol ? <div className="table-settings__row is-overlay"><RowContent {...rowProps(activeCol)} /></div> : null}</DragOverlay>,
              document.body,
            )}
        </DndContext>
        <div className="table-settings__foot">
          <span>{t("settings.density")}</span>
          <ToggleGroup type="single" size="sm" variant="outline" value={prefs.density} onValueChange={(v) => v && update({ density: v as TableDensity })}>
            {DENSITY_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} className="px-3">
                {t(`settings.densities.${o.label}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}
