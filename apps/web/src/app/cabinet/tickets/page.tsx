"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconTicket } from "@/components/icons";
import type { Ticket } from "@/lib/types";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Ticket[]>("/users/me/tickets")
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Мои билеты</h1>
      {tickets.length === 0 ? (
        <EmptyState
          icon={<IconTicket className="h-6 w-6" />}
          title="У вас пока нет билетов"
          description="Выберите интересное событие и приобретите билет"
          actionLabel="Смотреть события"
          actionHref="/"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tickets.map((t) => (
            <div key={t.id} className="card p-4">
              <Link href={`/events/${t.eventId}`} className="font-semibold hover:text-brand-700">
                {t.event?.title}
              </Link>
              {t.event && (
                <div className="mb-2 text-sm text-slate-500">
                  {new Date(t.event.startsAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} ·{" "}
                  {new Date(t.event.startsAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">#{t.qrCode.slice(0, 10)}</span>
                <span className="font-semibold">{Number(t.price).toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
