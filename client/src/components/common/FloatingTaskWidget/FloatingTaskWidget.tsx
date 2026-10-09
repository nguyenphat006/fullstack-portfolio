"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Download, FileSpreadsheet, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { axiosClient } from "@/lib/api/axiosClient";
import { downloadJobFile } from "@/lib/api/download";
import { cn } from "@/lib/utils";

export interface TrackedExportJob {
  id: number;
  title: string;
  entityType?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  totalRows?: number;
  processedRows?: number;
  fileUrl?: string;
  errorMessage?: string;
  createdAt: number;
}

interface JobStatusResponse {
  status?: TrackedExportJob["status"];
  progress?: number;
  total_rows?: number;
  processed_rows?: number;
  file_url?: string;
  error_message?: string;
}

const STORAGE_KEY = "app_tracked_export_jobs_v1";
const KEEP_MS = 12 * 60 * 60 * 1000;

const isActive = (j: TrackedExportJob) => j.status === "PENDING" || j.status === "PROCESSING";

function save(jobs: TrackedExportJob[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // Trình duyệt chặn lưu trữ -> chỉ giữ trong phiên
  }
}

/** Để bất kỳ component nào cũng kích hoạt theo dõi job xuất nền */
export const exportJobWatcher = {
  track: (jobId: number, title: string, totalRows?: number, entityType?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ERP_TRACK_EXPORT_JOB", { detail: { jobId, title, totalRows, entityType } }));
    }
  },
};

/** Khung nổi góc phải theo dõi tác vụ xuất dữ liệu nền (poll 1.5 giây khi còn tác vụ chạy) */
export function FloatingTaskWidget() {
  const t = useTranslations("dataTransfer.task");
  const tc = useTranslations("common");
  const [jobs, setJobs] = useState<TrackedExportJob[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [open, setOpen] = useState(false);

  // Khôi phục job trong 12 giờ gần nhất
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const valid = (JSON.parse(saved) as TrackedExportJob[]).filter((j) => Date.now() - j.createdAt < KEEP_MS);
      setJobs(valid); // eslint-disable-line react-hooks/set-state-in-effect
      if (valid.some(isActive)) setOpen(true);
    } catch {
      // Dữ liệu hỏng -> bỏ qua
    }
  }, []);

  const persist = useCallback((next: TrackedExportJob[]) => {
    setJobs(next);
    save(next);
  }, []);

  // Nhận job mới từ các trang
  useEffect(() => {
    const onTrack = (e: Event) => {
      const { jobId, title, totalRows, entityType } = (e as CustomEvent).detail || {};
      if (!jobId) return;
      setJobs((prev) => {
        if (prev.some((j) => j.id === jobId)) return prev;
        const job: TrackedExportJob = {
          id: jobId,
          title: title || "",
          entityType: entityType || "",
          status: "PENDING",
          progress: 5,
          totalRows: totalRows || 0,
          processedRows: 0,
          createdAt: Date.now(),
        };
        const next = [job, ...prev.slice(0, 4)]; // tối đa 5 job gần nhất
        save(next);
        return next;
      });
      setOpen(true);
      setMinimized(false);
    };
    window.addEventListener("ERP_TRACK_EXPORT_JOB", onTrack);
    return () => window.removeEventListener("ERP_TRACK_EXPORT_JOB", onTrack);
  }, []);

  // Cập nhật trạng thái các job đang chạy
  useEffect(() => {
    if (!jobs.some(isActive)) return;
    const timer = setInterval(async () => {
      let changed = false;
      const next = await Promise.all(
        jobs.map(async (job) => {
          if (!isActive(job)) return job;
          try {
            const data = await axiosClient.get<unknown, JobStatusResponse>(`/jobs/${job.id}/status/`);
            if (!data?.status) return job;
            changed = true;
            return {
              ...job,
              status: data.status,
              progress: data.progress ?? job.progress,
              totalRows: data.total_rows ?? job.totalRows,
              processedRows: data.processed_rows ?? job.processedRows,
              fileUrl: data.file_url ?? job.fileUrl,
              errorMessage: data.error_message ?? job.errorMessage,
            };
          } catch {
            return job; // mạng chập chờn -> thử lại lần sau
          }
        }),
      );
      if (changed) persist(next);
    }, 1500);
    return () => clearInterval(timer);
  }, [jobs, persist]);

  const dismiss = (id: number) => {
    const next = jobs.filter((j) => j.id !== id);
    persist(next);
    if (!next.length) setOpen(false);
  };

  if (!open || jobs.length === 0) return null;
  const activeCount = jobs.filter(isActive).length;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full border bg-popover px-4 py-2 text-sm font-medium shadow-lg transition-transform hover:scale-[1.02]"
      >
        {activeCount > 0 ? <Loader2 className="size-4 animate-spin text-primary" /> : <FileSpreadsheet className="size-4 text-primary" />}
        {activeCount > 0 ? t("exporting", { count: activeCount }) : t("minimizedTitle")}
        <ChevronUp className="size-3.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 w-[360px] max-w-[calc(100vw-48px)] rounded-xl border bg-popover p-3 shadow-lg" role="status" aria-live="polite">
      <div className="mb-2 flex items-center justify-between border-b pb-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <FileSpreadsheet className="size-4 text-primary" />
          {t("title")}
          {activeCount > 0 && <span className="text-xs font-normal text-muted-foreground">· {t("running", { count: activeCount })}</span>}
        </span>
        <span className="flex gap-0.5">
          <Button variant="ghost" size="icon-xs" aria-label={t("minimize")} onClick={() => setMinimized(true)}>
            <ChevronDown />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label={tc("actions.close")} onClick={() => setOpen(false)}>
            <X />
          </Button>
        </span>
      </div>

      <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {jobs.map((job) => {
          const done = job.status === "COMPLETED";
          const failed = job.status === "FAILED" || job.status === "CANCELLED";
          return (
            <li key={job.id} className="space-y-1.5 rounded-lg bg-[var(--c-bg-subtle)] p-2.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{job.title || t("jobTitle", { id: job.id })}</p>
                  <p className={cn("text-xs text-muted-foreground", done && "text-[var(--c-success)]", failed && "text-[var(--c-error)]")}>
                    {done
                      ? t("done", { rows: job.totalRows || 0 })
                      : failed
                        ? job.errorMessage || t("failed")
                        : job.status === "PENDING"
                          ? t("pending")
                          : t("progress", { processed: job.processedRows || 0, total: job.totalRows || 0 })}
                  </p>
                </div>
                <Button variant="ghost" size="icon-xs" aria-label={t("dismiss")} onClick={() => dismiss(job.id)}>
                  <X />
                </Button>
              </div>
              <Progress
                value={job.progress}
                className={cn("h-1.5", done && "[&>[data-slot=progress-indicator]]:bg-[var(--c-success)]", failed && "[&>[data-slot=progress-indicator]]:bg-[var(--c-error)]")}
              />
              {done && (
                <div className="flex justify-end">
                  <Button size="xs" onClick={() => downloadJobFile(job.id).catch(() => undefined)}>
                    <Download />
                    {t("download")}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
