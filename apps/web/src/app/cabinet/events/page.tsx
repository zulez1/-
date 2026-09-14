"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconCalendar } from "@/components/icons";
import type { EventItem } from "@/lib/types";
import { EVENT_STATUS_BADGE as STATUS_COLORS, EVENT_STATUS_LABELS as STATUS_LABELS } from "@/lib/status";

export default function MyEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<EventItem[]>("/users/me/events")
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id: string) => {
    await api(`/events/${id}/cancel`, { method: "POST" });
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "CANCELLED" } : e)));
  };

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Мои события</h1>
        <Link href="/cabinet/events/new" className="btn-primary">
          + Создать событие
        </Link>
      </div>
      {events.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="h-6 w-6" />}
          title="Вы ещё не создавали события"
          description="Организуйте своё первое спортивное событие и найдите участников"
          actionLabel="Создать событие"
          actionHref="/cabinet/events/new"
        />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/events/${e.id}`} className="font-semibold hover:text-brand-700">
                  {e.title}
                </Link>
                <div className="text-sm text-slate-500">
                  {new Date(e.startsAt).toLocaleDateString("ru-RU")} · {(e._count?.tickets ?? 0) + (e._count?.participants ?? 0)}
                  {e.capacity ? ` / ${e.capacity}` : ""} участников
                </div>
                {e.status === "REJECTED" && e.rejectionReason && (
                  <div className="mt-1 text-xs text-danger-600">Причина отклонения: {e.rejectionReason}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={STATUS_COLORS[e.status]}>{STATUS_LABELS[e.status]}</span>
                {(e.status === "PUBLISHED" || e.status === "PENDING_REVIEW") && (
                  <button className="btn-danger" onClick={() => cancel(e.id)}>
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
