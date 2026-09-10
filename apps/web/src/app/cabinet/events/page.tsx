"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/types";

const STATUS_LABELS: Record<EventItem["status"], string> = {
  DRAFT: "Черновик",
  PENDING_REVIEW: "На модерации",
  PUBLISHED: "Опубликовано",
  REJECTED: "Отклонено",
  CANCELLED: "Отменено",
  FINISHED: "Завершено",
};

const STATUS_COLORS: Record<EventItem["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  FINISHED: "bg-slate-100 text-slate-600",
};

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

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Мои события</h1>
        <Link href="/cabinet/events/new" className="btn-primary">
          + Создать событие
        </Link>
      </div>
      {events.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">Вы ещё не создавали события</div>
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
                  <div className="mt-1 text-xs text-red-600">Причина отклонения: {e.rejectionReason}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[e.status]}`}>{STATUS_LABELS[e.status]}</span>
                {(e.status === "PUBLISHED" || e.status === "PENDING_REVIEW") && (
                  <button className="btn-secondary" onClick={() => cancel(e.id)}>
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
