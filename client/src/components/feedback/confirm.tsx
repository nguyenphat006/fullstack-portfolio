"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Nút xác nhận màu đỏ (xóa, khóa…) */
  danger?: boolean;
  /** Chạy khi bấm xác nhận; hộp giữ trạng thái "đang xử lý" tới khi xong. Lỗi -> hộp vẫn mở. */
  onConfirm?: () => Promise<unknown> | unknown;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Hộp xác nhận dùng chung (thay modal.confirm / Popconfirm của antd). */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const tc = useTranslations("common");
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef<(value: boolean) => void>(undefined);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    resolver.current = undefined;
    setOptions(null);
    setBusy(false);
  };

  const handleConfirm = async () => {
    if (!options?.onConfirm) return close(true);
    setBusy(true);
    try {
      await options.onConfirm();
      close(true);
    } catch {
      setBusy(false); // lỗi đã được nơi gọi báo; giữ hộp mở để thử lại
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={options !== null} onOpenChange={(open) => !open && !busy && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{options?.cancelText ?? tc("actions.cancel")}</AlertDialogCancel>
            <Button variant={options?.danger ? "destructive" : "default"} onClick={handleConfirm} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {options?.confirmText ?? tc("actions.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error("useConfirm phải nằm trong ConfirmProvider (AppProviders)");
  return fn;
}
