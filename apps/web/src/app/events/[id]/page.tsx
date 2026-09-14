"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { EventItem } from "@/lib/types";
import { YandexMap } from "@/components/YandexMap";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SportIcon } from "@/components/icons";

const FORMAT_LABELS: Record<EventItem["format"], string> = {
  TICKETED: "Продажа билетов",
  VENUE_BOOKING: "Бронирование площадки",
  MEETUP: "Любительское мероприятие",
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const load = () => {
    api<EventItem>(`/events/${id}`, { auth: false })
      .then((data) => {
        setEvent(data);
        setJoined(Boolean(user && data.participants?.some((p) => p.user.id === user.id)));
      })
      .catch(() => setEvent(null));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleBuyTickets = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await api<{ order: { id: string } }>("/orders/tickets", {
        method: "POST",
        body: JSON.stringify({ eventId: id, quantity }),
      });
      router.push(`/checkout/${result.order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось оформить заказ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (joined) {
        await api(`/events/${id}/join`, { method: "DELETE" });
      } else {
        await api(`/events/${id}/join`, { method: "POST" });
      }
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось выполнить действие");
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) return <div className="py-20 text-center text-slate-400">Загрузка...</div>;

  const date = new Date(event.startsAt);
  const dateEnd = new Date(event.endsAt);
  const participantsCount = (event._count?.tickets ?? 0) + (event._count?.participants ?? 0);
  const isFull = Boolean(event.capacity && participantsCount >= event.capacity);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <span className="badge mb-2 bg-blue-50 text-blue-700">{FORMAT_LABELS[event.format]}</span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{event.title}</h1>
          </div>
          <FavoriteButton eventId={event.id} />
        </div>
        <p className="mb-4 text-slate-500">
          {date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}, {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}–
          {dateEnd.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} · {event.city?.name}
        </p>

        {event.sportType && (
          <div className="mb-4">
            <span className="badge bg-brand-50 text-brand-700">
              <SportIcon slug={event.sportType.slug} className="h-3.5 w-3.5" /> {event.sportType.name}
            </span>
          </div>
        )}

        <p className="mb-6 whitespace-pre-line text-slate-700">{event.description}</p>

        <div className="mb-6">
          <h2 className="mb-2 font-semibold">Место проведения</h2>
          <p className="mb-2 text-sm text-slate-500">{event.venue?.name ?? event.address ?? "Уточняется"}</p>
          <YandexMap
            center={[event.lat, event.lng]}
            zoom={14}
            points={[{ id: event.id, lat: event.lat, lng: event.lng, title: event.title, kind: "event" }]}
            height={300}
          />
        </div>

        {event.format === "MEETUP" && event.participants && event.participants.length > 0 && (
          <div>
            <h2 className="mb-2 font-semibold">Участники ({event.participants.length})</h2>
            <div className="flex flex-wrap gap-2">
              {event.participants.map((p) => (
                <span key={p.user.id} className="badge bg-slate-100 text-slate-700">
                  {p.user.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <div className="card p-4">
          {event.format === "MEETUP" ? (
            <>
              <div className="mb-3 text-lg font-bold">Бесплатное участие</div>
              <p className="mb-4 text-sm text-slate-500">
                {participantsCount}
                {event.capacity ? ` из ${event.capacity}` : ""} участников
              </p>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <button
                className={joined ? "btn-secondary w-full" : "btn-primary w-full"}
                disabled={submitting || (!joined && isFull)}
                onClick={handleJoinToggle}
              >
                {joined ? "Отменить участие" : isFull ? "Мест нет" : "Присоединиться"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-3 text-lg font-bold">
                {event.isFree ? "Бесплатно" : `${Number(event.ticketPrice ?? 0).toLocaleString("ru-RU")} ₽ / билет`}
              </div>
              {!event.isFree && (
                <>
                  <label className="label">Количество билетов</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input mb-4"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </>
              )}
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <button className="btn-primary w-full" disabled={submitting || isFull} onClick={handleBuyTickets}>
                {submitting ? "Оформляем..." : isFull ? "Билетов нет" : "Купить билет"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
