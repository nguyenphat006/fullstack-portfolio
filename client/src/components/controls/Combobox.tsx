"use client";

import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RemoveScroll } from "react-remove-scroll";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { normalizeText } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";

export interface ComboOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Biểu tượng trước nhãn */
  icon?: React.ReactNode;
  /** Ảnh đại diện (thumbnail) trước nhãn — ưu tiên hơn `icon` */
  image?: string | null;
  /** Mã hiển thị monospace bên phải (vd. mã NVL, mã vai trò) */
  code?: string | null;
  /** Dòng phụ dưới nhãn */
  description?: React.ReactNode;
  /** Badge bên phải (vd. StatusBadge) */
  badge?: React.ReactNode;
}

interface BaseProps {
  options: ComboOption[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Tìm ở server: gọi khi gõ (đã debounce ở nơi gọi, vd. `useEntityOptions`) — khi có thì tắt lọc tại chỗ */
  onSearch?: (text: string) => void;
  loading?: boolean;
  /** Gần cuối danh sách → tải trang tiếp (cuộn vô hạn) */
  onReachEnd?: () => void;
  /** Còn trang để tải (hiện dòng "đang tải thêm" ở cuối) */
  hasMore?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tự vẽ một dòng lựa chọn (thay bố cục mặc định ảnh · nhãn · mô tả · mã · badge) */
  renderOption?: (option: ComboOption, state: { selected: boolean }) => React.ReactNode;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  id?: string;
  /** Giữ để tương thích: ô tìm giờ nằm ngay trên ô chọn, dùng `placeholder` */
  searchPlaceholder?: string;
  /**
   * Hiện sẵn danh sách lựa chọn ngay dưới ô tìm (không thả xuống) — dùng trong popover lọc theo cột.
   * Chọn nhiều: mục đã chọn có dấu ✓ trong danh sách (không hiện chip). Esc không bị chặn để đóng popover cha.
   */
  inline?: boolean;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  allowClear?: boolean;
}

export type ComboboxProps = SingleProps | MultiProps;

/** Ảnh / icon đứng trước nhãn */
function OptionMedia({ option, size = "md" }: { option: ComboOption; size?: "sm" | "md" }) {
  // eslint-disable-next-line @next/next/no-img-element -- thumbnail nhỏ từ API, không cần next/image
  if (option.image) return <img src={option.image} alt="" className={cn("picker__avatar", size === "sm" && "picker__avatar--sm")} loading="lazy" />;
  if (option.icon) return <span className="picker__icon">{option.icon}</span>;
  return null;
}

/** Bố cục mặc định của một lựa chọn: ảnh · nhãn (+ mô tả) · mã · badge */
export function OptionContent({ option }: { option: ComboOption }) {
  return (
    <>
      <OptionMedia option={option} />
      <span className="picker__text">
        <span className="picker__label">{option.label}</span>
        {option.description && <span className="picker__desc">{option.description}</span>}
      </span>
      {option.code && <span className="picker__code">{option.code}</span>}
      {option.badge}
    </>
  );
}

/**
 * Ô chọn 1 / nhiều giá trị, **gõ tìm ngay trên ô** (không mở popup rồi mới tìm), tìm không dấu.
 * Lựa chọn hiển thị được ảnh, mã, mô tả, badge (hoặc `renderOption`). Bàn phím: ↑ ↓ Enter Esc, Backspace xóa giá trị cuối.
 * Danh sách ngắn (≤ 7) dùng Select; dữ liệu từ server dùng `useEntityOptions` / `EntityComboField`.
 * `inline`: danh sách luôn hiện dưới ô tìm (popover lọc theo cột).
 */
export function Combobox(props: ComboboxProps) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const { options, placeholder = t("selectPlaceholder"), emptyText = tc("status.noData"), disabled, className, onSearch, loading, onReachEnd, hasMore, renderOption, id, inline } = props;
  const [popupOpen, setOpen] = useState(false);
  const open = inline || popupOpen;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  // Hiệu năng: tra cứu theo Map, chuẩn hóa chữ không dấu một lần cho mỗi bộ options, lọc theo giá trị trì hoãn
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const searchIndex = useMemo(() => (onSearch ? null : options.map((o) => normalizeText(`${o.label} ${o.code ?? ""}`))), [options, onSearch]);
  const deferredQuery = useDeferredValue(query);
  const visible = useMemo(() => {
    if (!searchIndex || !deferredQuery) return options;
    const q = normalizeText(deferredQuery);
    return options.filter((_, i) => searchIndex[i].includes(q));
  }, [options, searchIndex, deferredQuery]);
  const optionOf = (v: string) => byValue.get(v);
  const labelOf = (v: string) => optionOf(v)?.label ?? v;
  const single = !props.multiple && selected[0] ? optionOf(selected[0]) ?? { value: selected[0], label: selected[0] } : null;

  // Inline: danh sách luôn hiện → báo "đang mở" khi gắn (nguồn remote bắt đầu tải), "đóng" khi gỡ
  const onOpenChangeRef = useRef(props.onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = props.onOpenChange;
  });
  useEffect(() => {
    if (!inline) return;
    onOpenChangeRef.current?.(true);
    return () => onOpenChangeRef.current?.(false);
  }, [inline]);

  const show = () => {
    if (disabled || open) return;
    setOpen(true);
    props.onOpenChange?.(true);
  };
  const hide = () => {
    if (inline || !open) return;
    setOpen(false);
    props.onOpenChange?.(false);
    if (query) {
      setQuery("");
      onSearch?.("");
    }
  };
  const changeQuery = (text: string) => {
    setQuery(text);
    setActive(0);
    onSearch?.(text);
    show();
  };

  const choose = (o: ComboOption) => {
    if (o.disabled) return;
    if (props.multiple) {
      props.onChange(selected.includes(o.value) ? selected.filter((x) => x !== o.value) : [...selected, o.value]);
      if (query) changeQuery("");
    } else {
      props.onChange(o.value === props.value && (props.allowClear || inline) ? null : o.value);
      hide();
    }
  };
  const clear = () => (props.multiple ? props.onChange([]) : props.onChange(null));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (visible.length ? (i + step + visible.length) % visible.length : 0));
    } else if (e.key === "Enter") {
      if (open && visible[active]) {
        e.preventDefault();
        choose(visible[active]);
      }
    } else if (e.key === "Escape") {
      if (open && !inline) {
        e.preventDefault();
        e.stopPropagation(); // không đóng luôn Dialog chứa ô chọn
        hide();
      }
    } else if (e.key === "Backspace" && !query && props.multiple && selected.length) {
      props.onChange(selected.slice(0, -1));
    } else if (e.key === "Tab") {
      hide();
    }
  };

  const list = (
    <PickerList
      listId={listId}
      items={visible}
      selected={selected}
      active={active}
      onActive={setActive}
      onChoose={choose}
      renderOption={renderOption}
      loading={loading}
      hasMore={hasMore}
      onReachEnd={onReachEnd}
      emptyText={emptyText}
      multiple={Boolean(props.multiple)}
    />
  );

  if (inline) {
    return (
      <div className={cn("picker-inline", className)}>
        <div className={cn("picker picker--search", disabled && "is-disabled")} onMouseDown={(e) => e.target !== inputRef.current && (e.preventDefault(), inputRef.current?.focus())}>
          <Search className="picker__search-icon" />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-label={props["aria-label"]}
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
            className="picker__input"
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(e) => changeQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="picker__suffix">
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {selected.length > 0 && !disabled && (
              <button type="button" tabIndex={-1} aria-label={t("clearValue")} className="picker__clear" onMouseDown={(e) => (e.preventDefault(), clear())}>
                <X className="size-3.5" />
              </button>
            )}
          </span>
        </div>
        {list}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={(v) => !v && hide()}>
      <PopoverAnchor asChild>
        <div
          ref={controlRef}
          className={cn("picker", props.multiple && "picker--multi", disabled && "is-disabled", open && "is-open", props["aria-invalid"] && "is-invalid", className)}
          onMouseDown={(e) => {
            if (disabled) return;
            if (e.target !== inputRef.current) e.preventDefault(); // giữ focus ở ô gõ
            inputRef.current?.focus();
            show();
          }}
        >
          <div className="picker__body">
            {props.multiple &&
              selected.map((v) => {
                const o = optionOf(v);
                return (
                  <span key={v} className="picker__chip">
                    {o && <OptionMedia option={o} size="sm" />}
                    <span className="truncate">{labelOf(v)}</span>
                    {!disabled && (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={tc("actions.remove")}
                        className="picker__chip-x"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onChange(selected.filter((x) => x !== v));
                        }}
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            {single && !query && (
              <span className="picker__value">
                <OptionMedia option={single} size="sm" />
                <span className="truncate">{single.label}</span>
              </span>
            )}
            <input
              ref={inputRef}
              id={id}
              role="combobox"
              aria-label={props["aria-label"]}
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-invalid={props["aria-invalid"]}
              aria-activedescendant={open && visible[active] ? `${listId}-${active}` : undefined}
              className={cn("picker__input", single && !query && "picker__input--over")}
              value={query}
              disabled={disabled}
              placeholder={single || (props.multiple && selected.length) ? "" : placeholder}
              autoComplete="off"
              onChange={(e) => changeQuery(e.target.value)}
              onFocus={show}
              onKeyDown={onKeyDown}
            />
          </div>
          <span className="picker__suffix">
            {loading && open && <Loader2 className="size-3.5 animate-spin" />}
            {props.allowClear && selected.length > 0 && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("clearValue")}
                className="picker__clear"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clear();
                }}
              >
                <X className="size-3.5" />
              </button>
            )}
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </span>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-56 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (controlRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
      >
        {/* Danh sách được portal ra ngoài: trong Dialog (đang khóa cuộn) phải tự giữ quyền cuộn, như Radix Select */}
        <RemoveScroll removeScrollBar={false}>{list}</RemoveScroll>
      </PopoverContent>
    </Popover>
  );
}

interface PickerListProps {
  listId: string;
  items: ComboOption[];
  selected: string[];
  active: number;
  onActive: (index: number) => void;
  onChoose: (option: ComboOption) => void;
  renderOption?: BaseProps["renderOption"];
  loading?: boolean;
  hasMore?: boolean;
  onReachEnd?: () => void;
  emptyText: string;
  multiple: boolean;
}

const ROW_HEIGHT = 36;
const LOAD_AHEAD = 5;

/**
 * Danh sách lựa chọn ảo hóa (@tanstack/react-virtual): chỉ vẽ các dòng đang nhìn thấy → mượt với hàng nghìn lựa chọn.
 * Cuộn vô hạn: khi dòng cuối được vẽ cách cuối danh sách ≤ 5 dòng thì gọi `onReachEnd` (chạy cả khi danh sách
 * chưa đủ dài để có thanh cuộn).
 */
function PickerList({ listId, items, selected, active, onActive, onChoose, renderOption, loading, hasMore, onReachEnd, emptyText, multiple }: PickerListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const footer = items.length > 0 && (hasMore || loading);
  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer trả hàm không memo hóa được; chỉ dùng kết quả trong render của component này
  const virtualizer = useVirtualizer({
    count: items.length + (footer ? 1 : 0),
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });
  const rows = virtualizer.getVirtualItems();
  const lastIndex = rows.length ? rows[rows.length - 1].index : -1;
  const selectedSet = new Set(selected);

  useEffect(() => {
    if (hasMore && !loading && lastIndex >= items.length - LOAD_AHEAD) onReachEnd?.();
  }, [lastIndex, items.length, hasMore, loading, onReachEnd]);

  // Giữ dòng đang chọn bằng bàn phím trong vùng nhìn thấy
  useEffect(() => {
    if (active < items.length) virtualizer.scrollToIndex(active, { align: "auto" });
  }, [active, items.length, virtualizer]);

  if (items.length === 0) {
    return (
      <div id={listId} role="listbox" className="picker__list">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="picker__empty">{emptyText}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={scrollRef} id={listId} role="listbox" aria-multiselectable={multiple || undefined} className="picker__list">
      <div className="relative w-full shrink-0" style={{ height: virtualizer.getTotalSize() }}>
        {rows.map((row) => {
          const style: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${row.start}px)` };
          if (row.index >= items.length) {
            return (
              <div key="__more" ref={virtualizer.measureElement} data-index={row.index} style={style} className="flex justify-center py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            );
          }
          const o = items[row.index];
          const isSelected = selectedSet.has(o.value);
          return (
            <div
              key={o.value}
              ref={virtualizer.measureElement}
              data-index={row.index}
              style={style}
              id={`${listId}-${row.index}`}
              role="option"
              aria-selected={isSelected}
              aria-disabled={o.disabled || undefined}
              className={cn("picker__option", row.index === active && "is-active", isSelected && "is-selected", o.disabled && "is-disabled")}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onActive(row.index)}
              onClick={() => onChoose(o)}
            >
              {renderOption ? renderOption(o, { selected: isSelected }) : <OptionContent option={o} />}
              <Check className={cn("picker__check", isSelected ? "opacity-100" : "opacity-0")} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
