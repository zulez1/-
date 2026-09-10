"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";

const STATUS_LABELS: Record<Booking["status"], string> = {
  PENDING: "Ожидает оплаты",
  CONFIRMED: "Подтверждено",
  CANCELLED: "Отменено",
  COMPLETED: "Завершено",
};

const STATUS_COLORS: Record<Booking["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-100 text-slate-500",
  COMPLETED: "bg-slate-100 text-slate-600",
};

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

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Мои бронирования</h1>
      {bookings.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">У вас пока нет бронирований площадок</div>
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
                <span className={`badge ${STATUS_COLORS[b.status]}`}>{STATUS_LABELS[b.status]}</span>
                {b.status === "PENDING" && b.order?.payment && b.order.payment.status !== "SUCCEEDED" && (
                  <Link href={`/checkout/${b.order.id}`} className="btn-primary">
                    Оплатить
                  </Link>
                )}
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <button className="btn-secondary" onClick={() => cancel(b.id)}>
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
