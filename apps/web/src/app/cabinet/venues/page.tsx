"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconBuilding } from "@/components/icons";
import type { Venue } from "@/lib/types";
import { VENUE_STATUS_BADGE as STATUS_COLORS, VENUE_STATUS_LABELS as STATUS_LABELS } from "@/lib/status";

export default function MyVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Venue[]>("/users/me/venues")
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Мои площадки</h1>
        <Link href="/cabinet/venues/new" className="btn-primary">
          + Добавить площадку
        </Link>
      </div>
      {venues.length === 0 ? (
        <EmptyState
          icon={<IconBuilding className="h-6 w-6" />}
          title="У вас пока нет добавленных площадок"
          description="Добавьте площадку, чтобы начать принимать бронирования"
          actionLabel="Добавить площадку"
          actionHref="/cabinet/venues/new"
        />
      ) : (
        <div className="space-y-3">
          {venues.map((v) => (
            <div key={v.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/venues/${v.id}`} className="font-semibold hover:text-brand-700">
                  {v.name}
                </Link>
                <div className="text-sm text-slate-500">
                  {v.address} · {v.city?.name}
                </div>
                {v.status === "REJECTED" && v.rejectionReason && (
                  <div className="mt-1 text-xs text-danger-600">Причина отклонения: {v.rejectionReason}</div>
                )}
              </div>
              <span className={STATUS_COLORS[v.status]}>{STATUS_LABELS[v.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
