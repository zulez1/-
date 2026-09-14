import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      <div className={`icon-chip h-12 w-12 ${tone === "success" ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-400"}`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-1">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
