"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Order } from "@/lib/types";
import { IconCheck } from "@/components/icons";

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = () => {
    api<Order>(`/orders/${orderId}`)
      .then(setOrder)
      .catch(() => setOrder(null));
  };

  useEffect(load, [orderId]);

  const pay = async () => {
    if (!order?.payment) return;
    setError(null);
    setProcessing(true);
    try {
      await api(`/payments/${order.payment.id}/confirm`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось выполнить оплату");
    } finally {
      setProcessing(false);
    }
  };

  if (!order) return <div className="py-20 text-center text-slate-400">Загрузка заказа...</div>;

  const isPaid = order.status === "PAID";
  const isTicketOrder = Boolean(order.tickets && order.tickets.length > 0);

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-6">
        <h1 className="mb-4 text-xl font-bold">
          {isTicketOrder ? "Заказ билетов" : "Бронирование площадки"}
        </h1>

        {isTicketOrder && order.tickets && (
          <div className="mb-4 space-y-2">
            {order.tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                <span>{t.event?.title}</span>
                <span className="font-medium">{Number(t.price).toLocaleString("ru-RU")} ₽</span>
              </div>
            ))}
          </div>
        )}

        {order.booking && (
          <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="font-medium">{order.booking.venue?.name}</div>
            <div className="text-slate-500">
              {new Date(order.booking.date).toLocaleDateString("ru-RU")} · {order.booking.startTime}–{order.booking.endTime}
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-slate-500">Итого</span>
          <span className="text-lg font-bold">{Number(order.totalAmount).toLocaleString("ru-RU")} ₽</span>
        </div>

        {error && <p className="mb-3 text-sm text-danger-600">{error}</p>}

        {isPaid ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <IconCheck className="h-6 w-6" />
            </div>
            <p className="mb-4 font-medium text-brand-700">Оплата прошла успешно!</p>
            <button className="btn-primary w-full" onClick={() => router.push("/cabinet")}>
              Перейти в личный кабинет
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-slate-400">
              Это демонстрационный (mock) платёжный провайдер — реальное списание средств не происходит.
            </p>
            <button className="btn-primary w-full" disabled={processing} onClick={pay}>
              {processing ? "Обрабатываем оплату..." : Number(order.totalAmount) === 0 ? "Подтвердить бесплатный заказ" : "Оплатить"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
