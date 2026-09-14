export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className ?? ""}`} />;
}

/** A single list row placeholder — matches the "card flex items-center justify-between p-4" rows used across cabinet/admin lists. */
export function ListRowSkeleton() {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card flex items-start gap-3 p-5">
      <Skeleton className="icon-chip bg-slate-200" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-7 w-1/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

/** Full-page gate loader (auth/role checks) — a brief moment, so kept minimal but not a bare text string. */
export function PageLoader() {
  return (
    <div className="flex flex-col items-center gap-3 py-24">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-brand-200" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
