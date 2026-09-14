"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useCity } from "@/lib/city-context";
import type { EventFormat, SportType, Venue } from "@/lib/types";

const FORMAT_OPTIONS: { value: EventFormat; label: string; hint: string }[] = [
  { value: "MEETUP", label: "Любительское мероприятие", hint: "Бесплатное участие, сбор игроков/бегунов" },
  { value: "TICKETED", label: "Продажа билетов", hint: "Турнир или матч с платным входом" },
  { value: "VENUE_BOOKING", label: "Бронирование площадки", hint: "Групповая аренда конкретной площадки" },
];

export default function NewEventPage() {
  const router = useRouter();
  const { cities, selectedCity } = useCity();
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    format: "MEETUP" as EventFormat,
    sportTypeId: "",
    cityId: selectedCity?.id ?? "",
    venueId: "",
    address: "",
    lat: selectedCity?.lat ?? 55.75,
    lng: selectedCity?.lng ?? 37.6,
    startsAt: "",
    endsAt: "",
    capacity: 20,
    ticketPrice: 500,
    isFree: false,
  });

  useEffect(() => {
    api<SportType[]>("/sport-types", { auth: false }).then(setSportTypes).catch(() => setSportTypes([]));
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setForm((f) => ({ ...f, cityId: selectedCity.id, lat: selectedCity.lat, lng: selectedCity.lng }));
    }
  }, [selectedCity]);

  useEffect(() => {
    if (!form.cityId) return;
    const city = cities.find((c) => c.id === form.cityId);
    if (!city) return;
    api<Venue[]>(`/venues?citySlug=${city.slug}`, { auth: false })
      .then(setVenues)
      .catch(() => setVenues([]));
  }, [form.cityId, cities]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const venue = venues.find((v) => v.id === form.venueId);
      await api("/events", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          format: form.format,
          sportTypeId: form.sportTypeId,
          cityId: form.cityId,
          venueId: form.venueId || undefined,
          address: form.address || venue?.address,
          lat: venue ? venue.lat : form.lat,
          lng: venue ? venue.lng : form.lng,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
          capacity: form.capacity || undefined,
          ticketPrice: form.format === "TICKETED" && !form.isFree ? form.ticketPrice : undefined,
          isFree: form.format !== "TICKETED" ? true : form.isFree,
        }),
      });
      router.push("/cabinet/events");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось создать событие");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">Создать событие</h1>
      <p className="mb-6 text-sm text-slate-500">
        После создания событие отправляется на модерацию и появится в каталоге после проверки администратором.
      </p>

      <form className="card space-y-4 p-6" onSubmit={onSubmit}>
        <div>
          <label className="label">Формат события</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`rounded-lg border p-3 text-left text-sm ${
                  form.format === opt.value ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-brand-300"
                }`}
                onClick={() => setForm({ ...form, format: opt.value })}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-slate-500">{opt.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Название</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Описание</label>
          <textarea
            className="input"
            rows={4}
            required
            minLength={10}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Вид спорта</label>
            <select className="input" required value={form.sportTypeId} onChange={(e) => setForm({ ...form, sportTypeId: e.target.value })}>
              <option value="">Выберите</option>
              {sportTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Город</label>
            <select className="input" required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value, venueId: "" })}>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Площадка (необязательно)</label>
          <select className="input" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })}>
            <option value="">Без привязки к площадке</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {!form.venueId && (
          <div>
            <label className="label">Адрес проведения</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Например: Парк Горького, главный вход" />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Дата и время начала</label>
            <input
              className="input"
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Дата и время окончания</label>
            <input
              className="input"
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Вместимость</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
          {form.format === "TICKETED" && (
            <div>
              <label className="label">Цена билета, ₽</label>
              <input
                className="input"
                type="number"
                min={0}
                disabled={form.isFree}
                value={form.ticketPrice}
                onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) })}
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
                Бесплатный вход
              </label>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}
