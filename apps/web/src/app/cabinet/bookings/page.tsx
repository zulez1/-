"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconBuilding } from "@/components/icons";
import type { Booking } from "@/lib/types";
import { BOOKING_STATUS_BADGE as STATUS_COLORS, BOOKING_STATUS_LABELS as STATUS_LABELS } from "@/lib/status";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Booking[]>("/users/me/bookings")
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id: string) => {
    await api(`/bookings/${id}/cancel`, { method: "POST" });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
  };

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Мои бронирования</h1>
      {bookings.length === 0 ? (
        <EmptyState
          icon={<IconBuilding className="h-6 w-6" />}
          title="У вас пока нет бронирований площадок"
          description="Найдите подходящую площадку и забронируйте время для игры"
          actionLabel="Найти площадку"
          actionHref="/?tab=venues"
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/venues/${b.venueId}`} className="font-semibold hover:text-brand-700">
                  {b.venue?.name}
                </Link>
                <div className="text-sm text-slate-500">
                  {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime} · {b.venue?.city?.name}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{Number(b.totalPrice).toLocaleString("ru-RU")} ₽</span>
                <span className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</span>
                {b.status === "PENDING" && b.order?.payment && b.order.payment.status !== "SUCCEEDED" && (
                  <Link href={`/checkout/${b.order.id}`} className="btn-primary">
                    Оплатить
                  </Link>
                )}
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <button className="btn-danger" onClick={() => cancel(b.id)}>
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
