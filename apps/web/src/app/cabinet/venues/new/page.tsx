"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useCity } from "@/lib/city-context";
import type { SportType } from "@/lib/types";

export default function NewVenuePage() {
  const router = useRouter();
  const { cities, selectedCity } = useCity();
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    cityId: selectedCity?.id ?? "",
    lat: selectedCity?.lat ?? 55.75,
    lng: selectedCity?.lng ?? 37.6,
    pricePerHour: 1500,
    sportTypeIds: [] as string[],
    amenities: "",
    workingHoursStart: "08:00",
    workingHoursEnd: "23:00",
  });

  useEffect(() => {
    api<SportType[]>("/sport-types", { auth: false }).then(setSportTypes).catch(() => setSportTypes([]));
  }, []);

  useEffect(() => {
    if (selectedCity) setForm((f) => ({ ...f, cityId: selectedCity.id, lat: selectedCity.lat, lng: selectedCity.lng }));
  }, [selectedCity]);

  const toggleSport = (id: string) => {
    setForm((f) => ({
      ...f,
      sportTypeIds: f.sportTypeIds.includes(id) ? f.sportTypeIds.filter((s) => s !== id) : [...f.sportTypeIds, id],
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.sportTypeIds.length === 0) {
      setError("Выберите хотя бы один вид спорта");
      return;
    }
    setSubmitting(true);
    try {
      await api("/venues", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amenities: form.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      });
      router.push("/cabinet/venues");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось добавить площадку");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">Добавить площадку</h1>
      <p className="mb-6 text-sm text-slate-500">
        Площадка появится в каталоге после проверки администратором.
      </p>

      <form className="card space-y-4 p-6" onSubmit={onSubmit}>
        <div>
          <label className="label">Название</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
            <label className="label">Город</label>
            <select className="input" required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Цена за час, ₽</label>
            <input
              className="input"
              type="number"
              min={0}
              required
              value={form.pricePerHour}
              onChange={(e) => setForm({ ...form, pricePerHour: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="label">Адрес</label>
          <input className="input" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Широта (lat)</label>
            <input
              className="input"
              type="number"
              step="0.0001"
              required
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Долгота (lng)</label>
            <input
              className="input"
              type="number"
              step="0.0001"
              required
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-400">
          Координаты можно уточнить на Яндекс.Картах: найдите адрес, кликните правой кнопкой мыши и скопируйте координаты.
        </p>

        <div>
          <label className="label">Виды спорта</label>
          <div className="flex flex-wrap gap-2">
            {sportTypes.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`badge border ${
                  form.sportTypeIds.includes(s.id) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-600"
                }`}
                onClick={() => toggleSport(s.id)}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Начало работы</label>
            <input
              className="input"
              type="time"
              value={form.workingHoursStart}
              onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Окончание работы</label>
            <input
              className="input"
              type="time"
              value={form.workingHoursEnd}
              onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Удобства (через запятую)</label>
          <input
            className="input"
            placeholder="Раздевалки, Душевые, Парковка"
            value={form.amenities}
            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}
