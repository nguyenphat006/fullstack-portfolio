import { Skeleton } from "@/components/ui/skeleton";

/** Khung chờ khi chuyển trang trong khu vực dashboard (Suspense boundary của route). */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}
