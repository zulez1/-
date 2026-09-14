"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Venue } from "@/lib/types";
import { YandexMap } from "@/components/YandexMap";
import { FavoriteButton } from "@/components/FavoriteButton";
import { IconStar, SportIcon } from "@/components/icons";

function generateSlots(start: string, end: string, stepMinutes = 60): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  const slots: string[] = [];
  for (let m = toMin(start); m + stepMinutes <= toMin(end); m += stepMinutes) {
    slots.push(toTime(m));
  }
  return slots;
}

function todayIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [date, setDate] = useState(todayIso());
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<Venue>(`/venues/${id}`, { auth: false })
      .then(setVenue)
      .catch(() => setVenue(null));
  }, [id]);

  useEffect(() => {
    if (!venue) return;
    api<{ workingHoursStart: string; workingHoursEnd: string; bookedSlots: { startTime: string; endTime: string }[] }>(
      `/venues/${id}/availability?date=${date}`,
      { auth: false },
    )
      .then((data) => setBookedSlots(data.bookedSlots))
      .catch(() => setBookedSlots([]));
  }, [venue, id, date]);

  const allSlots = useMemo(() => {
    if (!venue) return [];
    return generateSlots(venue.workingHoursStart, venue.workingHoursEnd);
  }, [venue]);

  const isSlotAvailable = (slot: string) => {
    const [h, m] = slot.split(":").map(Number);
    const slotStart = h * 60 + m;
    const slotEnd = slotStart + durationHours * 60;
    return !bookedSlots.some((b) => {
      const [bh, bm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      const bStart = bh * 60 + bm;
      const bEnd = eh * 60 + em;
      return slotStart < bEnd && slotEnd > bStart;
    });
  };

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!startTime) return;
    setError(null);
    setSubmitting(true);
    try {
      const endTime = addMinutes(startTime, durationHours * 60);
      const result = await api<{ order: { id: string } }>("/bookings", {
        method: "POST",
        body: JSON.stringify({ venueId: id, date, startTime, endTime }),
      });
      router.push(`/checkout/${result.order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось создать бронирование");
    } finally {
      setSubmitting(false);
    }
  };

  if (!venue) return <div className="py-20 text-center text-slate-400">Загрузка...</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-1 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{venue.name}</h1>
          <FavoriteButton venueId={venue.id} />
        </div>
        <p className="mb-4 text-slate-500">{venue.address}</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {venue.sportTypes?.map((st) => (
            <span key={st.sportType.id} className="badge bg-brand-50 text-brand-700">
              <SportIcon slug={st.sportType.slug} className="h-3.5 w-3.5" /> {st.sportType.name}
            </span>
          ))}
        </div>

        <p className="mb-6 whitespace-pre-line text-slate-700">{venue.description}</p>

        {venue.amenities.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 font-semibold">Удобства</h2>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((a) => (
                <span key={a} className="badge bg-slate-100 text-slate-600">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="mb-2 font-semibold">На карте</h2>
          <YandexMap
            center={[venue.lat, venue.lng]}
            zoom={14}
            points={[{ id: venue.id, lat: venue.lat, lng: venue.lng, title: venue.name, kind: "venue" }]}
            height={300}
          />
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Отзывы</h2>
          {venue.reviews && venue.reviews.length > 0 ? (
            <div className="space-y-3">
              {venue.reviews.map((r: any) => (
                <div key={r.id} className="card p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{r.user?.name}</span>
                    <span className="badge bg-amber-100 text-amber-800">
                      <IconStar className="h-3 w-3" /> {r.rating}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Пока нет отзывов</p>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <div className="card p-4">
          <div className="mb-3 text-lg font-bold">{Number(venue.pricePerHour).toLocaleString("ru-RU")} ₽ / час</div>

          <label className="label">Дата</label>
          <input
            type="date"
            className="input mb-3"
            value={date}
            min={todayIso()}
            onChange={(e) => {
              setDate(e.target.value);
              setStartTime(null);
            }}
          />

          <label className="label">Длительность</label>
          <select
            className="input mb-3"
            value={durationHours}
            onChange={(e) => {
              setDurationHours(Number(e.target.value));
              setStartTime(null);
            }}
          >
            {[1, 2, 3, 4].map((h) => (
              <option key={h} value={h}>
                {h} ч
              </option>
            ))}
          </select>

          <label className="label">Время начала</label>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {allSlots.map((slot) => {
              const available = isSlotAvailable(slot);
              return (
                <button
                  key={slot}
                  disabled={!available}
                  className={`rounded-lg border px-2 py-1.5 text-sm ${
                    startTime === slot
                      ? "border-brand-600 bg-brand-600 text-white"
                      : available
                        ? "border-slate-300 hover:border-brand-400"
                        : "cursor-not-allowed border-slate-100 text-slate-300 line-through"
                  }`}
                  onClick={() => setStartTime(slot)}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <button className="btn-primary w-full" disabled={!startTime || submitting} onClick={handleBook}>
            {submitting ? "Бронируем..." : `Забронировать за ${(Number(venue.pricePerHour) * durationHours).toLocaleString("ru-RU")} ₽`}
          </button>
        </div>
      </div>
    </div>
  );
}
