"use client";

import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCity } from "@/lib/city-context";
import { Avatar } from "@/components/Avatar";
import { StatCardSkeleton } from "@/components/Skeleton";
import {
  IconBuilding,
  IconStar,
  IconTicket,
  IconTrendingUp,
  IconUsers,
} from "@/components/icons";

const ROLE_LABELS: Record<string, string> = { USER: "Участник", ORGANIZER: "Организатор", ADMIN: "Администратор" };

interface UserStats {
  ticketsCount: number;
  bookingsCount: number;
  favoritesCount: number;
  eventsCount?: number;
  venuesCount?: number;
  avgRating?: number | null;
  reviewsCount?: number;
  ticketsSold?: number;
  revenue?: number;
  pendingVenues?: number;
  pendingEvents?: number;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { cities } = useCity();
  const [form, setForm] = useState({ name: "", phone: "", cityId: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "", cityId: user.cityId ?? "" });
  }, [user]);

  useEffect(() => {
    api<UserStats>("/users/me/stats")
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api("/users/me", { method: "PATCH", body: JSON.stringify(form) });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось обновить профиль");
    } finally {
      setSubmitting(false);
    }
  };

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card flex flex-wrap items-center gap-4 p-6">
        <Avatar name={user?.name ?? "?"} src={user?.avatarUrl} size={64} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-slate-900">{user?.name}</div>
          <div className="text-sm text-slate-500">{user?.email}</div>
        </div>
        <span className="badge-info">{ROLE_LABELS[user?.role ?? "USER"]}</span>
      </div>

      <div>
        <h2 className="section-title mb-3 text-lg">Активность</h2>
        {!stats ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile icon={<IconTicket className="h-[18px] w-[18px]" />} chip="bg-secondary-50 text-secondary-600" label="Билетов куплено" value={stats.ticketsCount} />
            <StatTile icon={<IconBuilding className="h-[18px] w-[18px]" />} chip="bg-accent-50 text-accent-600" label="Бронирований" value={stats.bookingsCount} />
            <StatTile icon={<IconStar className="h-[18px] w-[18px]" />} chip="bg-warning-50 text-warning-600" label="В избранном" value={stats.favoritesCount} />
            {isOrganizer && (
              <>
                <StatTile icon={<IconUsers className="h-[18px] w-[18px]" />} chip="bg-brand-50 text-brand-700" label="Событий создано" value={stats.eventsCount ?? 0} />
                <StatTile icon={<IconBuilding className="h-[18px] w-[18px]" />} chip="bg-accent-50 text-accent-600" label="Площадок" value={stats.venuesCount ?? 0} />
                <StatTile
                  icon={<IconStar className="h-[18px] w-[18px]" />}
                  chip="bg-warning-50 text-warning-600"
                  label="Средний рейтинг"
                  value={stats.avgRating ? `${stats.avgRating} · ${stats.reviewsCount} отз.` : "Пока нет отзывов"}
                />
                <StatTile icon={<IconTrendingUp className="h-[18px] w-[18px]" />} chip="bg-secondary-50 text-secondary-600" label="Выручка" value={`${(stats.revenue ?? 0).toLocaleString("ru-RU")} ₽`} />
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="section-title mb-3 text-lg">Личные данные</h2>
        <form className="card space-y-4 p-6" onSubmit={onSubmit}>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={user?.email ?? ""} disabled />
          </div>
          <div>
            <label className="label">Имя</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Телефон</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Город</label>
            <select className="input" value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
              <option value="">Не выбран</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-danger-600">{error}</p>}
          {success && <p className="text-sm text-brand-600">Профиль обновлён</p>}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatTile({ icon, chip, label, value }: { icon: ReactNode; chip: string; label: string; value: string | number }) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <div className={`icon-chip ${chip}`}>{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
