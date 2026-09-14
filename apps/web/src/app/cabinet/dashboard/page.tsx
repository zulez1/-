"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatCardSkeleton, ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  IconBuilding,
  IconCalendar,
  IconStar,
  IconTicket,
  IconTrendingUp,
  IconUsers,
} from "@/components/icons";
import type { EventItem, Venue } from "@/lib/types";

interface OrganizerStats {
  eventsCount: number;
  venuesCount: number;
  avgRating: number | null;
  reviewsCount: number;
  ticketsSold: number;
  revenue: number;
  pendingVenues: number;
  pendingEvents: number;
}

export default function OrganizerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === "USER") router.push("/cabinet");
  }, [authLoading, user, router]);

  useEffect(() => {
    Promise.all([
      api<OrganizerStats>("/users/me/stats"),
      api<EventItem[]>("/users/me/events"),
      api<Venue[]>("/users/me/venues"),
    ])
      .then(([s, e, v]) => {
        setStats(s);
        setEvents(e);
        setVenues(v);
      })
      .finally(() => setLoading(false));
  }, []);

  const topEvents = [...events]
    .sort((a, b) => (b._count?.tickets ?? 0) + (b._count?.participants ?? 0) - ((a._count?.tickets ?? 0) + (a._count?.participants ?? 0)))
    .slice(0, 5);
  const topVenues = [...venues].sort((a, b) => (b._count?.bookings ?? 0) - (a._count?.bookings ?? 0)).slice(0, 5);
  const pendingTotal = (stats?.pendingEvents ?? 0) + (stats?.pendingVenues ?? 0);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Дашборд организатора</h1>
      <p className="mb-6 text-slate-500">Сводка по вашим событиям и площадкам.</p>

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi icon={<IconCalendar className="h-[18px] w-[18px]" />} chip="bg-brand-50 text-brand-700" label="Событий создано" value={stats.eventsCount} />
          <Kpi icon={<IconBuilding className="h-[18px] w-[18px]" />} chip="bg-accent-50 text-accent-600" label="Площадок" value={stats.venuesCount} />
          <Kpi icon={<IconTicket className="h-[18px] w-[18px]" />} chip="bg-secondary-50 text-secondary-600" label="Билетов продано" value={stats.ticketsSold} />
          <Kpi icon={<IconTrendingUp className="h-[18px] w-[18px]" />} chip="bg-warning-50 text-warning-600" label="Выручка" value={`${stats.revenue.toLocaleString("ru-RU")} ₽`} />
          <Kpi
            icon={<IconStar className="h-[18px] w-[18px]" />}
            chip="bg-warning-50 text-warning-600"
            label="Средний рейтинг"
            value={stats.avgRating ? `${stats.avgRating} (${stats.reviewsCount})` : "Нет отзывов"}
          />
          <Kpi icon={<IconUsers className="h-[18px] w-[18px]" />} chip="bg-danger-50 text-danger-600" label="На модерации" value={pendingTotal} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-lg">Топ событий</h2>
            <Link href="/cabinet/events" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              Все события
            </Link>
          </div>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : topEvents.length === 0 ? (
            <EmptyState
              icon={<IconCalendar className="h-6 w-6" />}
              title="Вы ещё не создавали события"
              actionLabel="Создать событие"
              actionHref="/cabinet/events/new"
            />
          ) : (
            <div className="space-y-2">
              {topEvents.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="card-interactive flex items-center justify-between gap-3 p-3">
                  <span className="truncate font-medium text-slate-900">{e.title}</span>
                  <span className="shrink-0 text-sm text-slate-500">
                    {(e._count?.tickets ?? 0) + (e._count?.participants ?? 0)} участников
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-lg">Топ площадок</h2>
            <Link href="/cabinet/venues" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              Все площадки
            </Link>
          </div>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : topVenues.length === 0 ? (
            <EmptyState
              icon={<IconBuilding className="h-6 w-6" />}
              title="У вас пока нет площадок"
              actionLabel="Добавить площадку"
              actionHref="/cabinet/venues/new"
            />
          ) : (
            <div className="space-y-2">
              {topVenues.map((v) => (
                <Link key={v.id} href={`/venues/${v.id}`} className="card-interactive flex items-center justify-between gap-3 p-3">
                  <span className="truncate font-medium text-slate-900">{v.name}</span>
                  <span className="shrink-0 text-sm text-slate-500">{v._count?.bookings ?? 0} бронирований</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, chip, label, value }: { icon: ReactNode; chip: string; label: string; value: string | number }) {
  return (
    <div className="card flex items-start gap-3 p-5">
      <div className={`icon-chip ${chip}`}>{icon}</div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </div>
    </div>
  );
}
