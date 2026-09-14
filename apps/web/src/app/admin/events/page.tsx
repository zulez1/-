"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/types";

interface PendingEvent extends EventItem {
  organizer: { id: string; name: string; email: string };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    api<PendingEvent[]>("/admin/events/pending")
      .then(setEvents)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    await api(`/admin/events/${id}/approve`, { method: "POST" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const reject = async (id: string) => {
    await api(`/admin/events/${id}/reject`, { method: "POST", body: JSON.stringify({ reason: reasonDrafts[id] }) });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Модерация событий</h1>
      {events.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">Нет событий, ожидающих модерации</div>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(e.startsAt).toLocaleString("ru-RU")} · {e.city?.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    Организатор: {e.organizer.name} ({e.organizer.email})
                  </div>
                </div>
              </div>
              <p className="mb-3 text-sm text-slate-600">{e.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary" onClick={() => approve(e.id)}>
                  Одобрить
                </button>
                <input
                  className="input flex-1 min-w-[160px]"
                  placeholder="Причина отклонения (необязательно)"
                  value={reasonDrafts[e.id] ?? ""}
                  onChange={(ev) => setReasonDrafts({ ...reasonDrafts, [e.id]: ev.target.value })}
                />
                <button className="btn-danger" onClick={() => reject(e.id)}>
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
