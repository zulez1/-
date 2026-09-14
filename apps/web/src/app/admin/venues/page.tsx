"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconCheck } from "@/components/icons";
import type { Venue } from "@/lib/types";

interface PendingVenue extends Venue {
  owner: { id: string; name: string; email: string };
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    api<PendingVenue[]>("/admin/venues/pending")
      .then(setVenues)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    await api(`/admin/venues/${id}/approve`, { method: "POST" });
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  const reject = async (id: string) => {
    await api(`/admin/venues/${id}/reject`, { method: "POST", body: JSON.stringify({ reason: reasonDrafts[id] }) });
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Модерация площадок</h1>
      {venues.length === 0 ? (
        <EmptyState
          icon={<IconCheck className="h-6 w-6" />}
          title="Нет площадок, ожидающих модерации"
          description="Все заявки обработаны — новые появятся здесь автоматически"
          tone="success"
        />
      ) : (
        <div className="space-y-4">
          {venues.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-sm text-slate-500">
                    {v.address} · {v.city?.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    Владелец: {v.owner.name} ({v.owner.email})
                  </div>
                </div>
                <span className="font-semibold">{Number(v.pricePerHour).toLocaleString("ru-RU")} ₽/час</span>
              </div>
              <p className="mb-3 text-sm text-slate-600">{v.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary" onClick={() => approve(v.id)}>
                  Одобрить
                </button>
                <input
                  className="input flex-1 min-w-[160px]"
                  placeholder="Причина отклонения (необязательно)"
                  value={reasonDrafts[v.id] ?? ""}
                  onChange={(e) => setReasonDrafts({ ...reasonDrafts, [v.id]: e.target.value })}
                />
                <button className="btn-danger" onClick={() => reject(v.id)}>
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
