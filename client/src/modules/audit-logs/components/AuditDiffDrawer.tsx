"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AUDIT_ACTION_STATUS } from "../status";
import { auditFieldLabel, auditValueText } from "../format";
import type { AuditLogItem } from "../types";

/** `labels`: tên hiển thị khi không có User-Agent / không nhận ra trình duyệt (theo ngôn ngữ) */
function parseUserAgent(ua: string | undefined, labels: { system: string; browser: string }): { name: string; isMobile: boolean } {
  if (!ua) return { name: labels.system, isMobile: false };
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  let browser = labels.browser;
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/")) browser = "Safari";
  else if (ua.includes("PostmanRuntime")) browser = "Postman";
  else if (ua.includes("curl") || ua.includes("python")) browser = "API Client";

  let os = "";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone")) os = "iOS";
  else if (ua.includes("iPad")) os = "iPadOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { name: os ? `${browser} (${os})` : browser, isMobile };
}

function Value({ text, tone, emptyText }: { text: string | null; tone: "old" | "new"; emptyText: string }) {
  if (text === null) return <span className="text-xs text-muted-foreground italic">{emptyText}</span>;
  return <span className={tone === "old" ? "audit-value audit-value--old" : "audit-value audit-value--new"}>{text}</span>;
}

function Info({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "min-w-0 sm:col-span-3" : "min-w-0"}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm">{children}</dd>
    </div>
  );
}

interface AuditDiffDrawerProps {
  open: boolean;
  onClose: () => void;
  logItem: AuditLogItem | null;
}

/** Chi tiết 1 dòng nhật ký: ai · lúc nào · từ đâu · trường thay đổi · dữ liệu toàn phần */
export function AuditDiffDrawer({ open, onClose, logItem }: AuditDiffDrawerProps) {
  const t = useTranslations("auditLogs");
  const tc = useTranslations("common");
  const yesNo = { yes: tc("status.yes"), no: tc("status.no") };
  const [copied, setCopied] = useState(false);
  const [shownId, setShownId] = useState(logItem?.id);
  if (shownId !== logItem?.id) {
    setShownId(logItem?.id);
    setCopied(false);
  }

  const agent = parseUserAgent(logItem?.user_agent, { system: t("system"), browser: t("drawer.browser") });
  const hasDiffs = !!logItem?.diff?.length;
  const snapshotKeys = logItem?.snapshot ? Object.keys(logItem.snapshot).length : 0;

  const copySnapshot = () => {
    if (!logItem?.snapshot) return;
    navigator.clipboard.writeText(JSON.stringify(logItem.snapshot, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-[720px]">
        {logItem && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2">
                {t("drawer.title")}
                <StatusBadge map={AUDIT_ACTION_STATUS} value={logItem.action_code} />
              </SheetTitle>
              <SheetDescription>
                {logItem.model_name} <span className="font-mono">#{logItem.object_id}</span>
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                <Info label={t("drawer.time")}>
                  <span className="font-mono">{logItem.created_at}</span>
                </Info>
                <Info label={t("fields.user")}>
                  {logItem.user.full_name || logItem.user.username} <span className="text-xs text-muted-foreground">@{logItem.user.username}</span>
                </Info>
                <Info label={t("drawer.method")}>{logItem.http_method ? <span className="font-mono font-semibold">{logItem.http_method.toUpperCase()}</span> : "—"}</Info>
                <Info label={t("fields.ip")}>{logItem.ip_address ? <span className="font-mono">{logItem.ip_address}</span> : t("drawer.internal")}</Info>
                <Info label={t("drawer.device")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5">
                        {agent.isMobile ? <Smartphone className="size-3.5" /> : <Monitor className="size-3.5" />}
                        {agent.name}
                      </span>
                    </TooltipTrigger>
                    {logItem.user_agent && <TooltipContent className="max-w-sm break-all">{logItem.user_agent}</TooltipContent>}
                  </Tooltip>
                </Info>
                <Info label={t("drawer.url")} wide>
                  <span className="font-mono text-xs break-all whitespace-normal">{logItem.url || t("drawer.internalSystem")}</span>
                </Info>
              </dl>

              <section>
                <h3 className="mb-2 text-sm font-semibold">
                  {t("fields.changedFields")} {hasDiffs && <span className="font-normal text-muted-foreground">({logItem.diff.length})</span>}
                </h3>
                {hasDiffs ? (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                          <th className="w-40 px-3 py-2 text-left font-medium">{t("drawer.field")}</th>
                          <th className="px-3 py-2 text-left font-medium">{t("drawer.before")}</th>
                          <th className="px-3 py-2 text-left font-medium">{t("drawer.after")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logItem.diff.map((d) => (
                          <tr key={d.field} className="border-t align-top">
                            <td className="px-3 py-2 font-medium">{auditFieldLabel(d)}</td>
                            <td className="px-3 py-2">
                              <Value text={auditValueText(d.old_value, d.old_display, yesNo)} tone="old" emptyText={t("drawer.emptyValue")} />
                            </td>
                            <td className="px-3 py-2">
                              <Value text={auditValueText(d.new_value, d.new_display, yesNo)} tone="new" emptyText={t("drawer.emptyValue")} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {logItem.action_code === "CREATE"
                      ? t("drawer.createdHint")
                      : logItem.action_code === "DELETE"
                        ? t("drawer.deletedHint")
                        : t("drawer.noChanges")}
                  </p>
                )}
              </section>

              {snapshotKeys > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {t("drawer.snapshot")} <span className="font-normal text-muted-foreground">({t("drawer.fieldCount", { count: snapshotKeys })})</span>
                    </h3>
                    <Button variant="ghost" size="sm" onClick={copySnapshot}>
                      {copied ? <Check className="text-[var(--c-success)]" /> : <Copy />}
                      {copied ? tc("actions.copied") : tc("actions.copy")}
                    </Button>
                  </div>
                  <pre className="max-h-[420px] overflow-auto rounded-md border bg-[#0F172A] p-4 font-mono text-xs leading-relaxed text-slate-200">
                    {JSON.stringify(logItem.snapshot, null, 2)}
                  </pre>
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
