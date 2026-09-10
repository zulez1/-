"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Venue } from "@/lib/types";

const STATUS_LABELS: Record<Venue["status"], string> = {
  PENDING_REVIEW: "На модерации",
  PUBLISHED: "Опубликована",
  REJECTED: "Отклонена",
  ARCHIVED: "В архиве",
};

const STATUS_COLORS: Record<Venue["status"], string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export default function MyVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Venue[]>("/users/me/venues")
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Мои площадки</h1>
        <Link href="/cabinet/venues/new" className="btn-primary">
          + Добавить площадку
        </Link>
      </div>
      {venues.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">У вас пока нет добавленных площадок</div>
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
                  <div className="mt-1 text-xs text-red-600">Причина отклонения: {v.rejectionReason}</div>
                )}
              </div>
              <span className={`badge ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
