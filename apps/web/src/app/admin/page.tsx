"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { IconBuilding, IconTicket, IconTrendingUp, IconUser, IconUsers } from "@/components/icons";
import { StatCardSkeleton } from "@/components/Skeleton";
import { Sparkline } from "@/components/Sparkline";

interface Stats {
  users: number;
  venues: number;
  events: number;
  orders: number;
  revenue: number;
}

interface TrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[] | null>(null);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats);
    api<TrendPoint[]>("/admin/stats/trend").then(setTrend);
  }, []);

  if (!stats) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Статистика платформы</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const cards: { label: string; value: string | number; icon: ReactNode; chip: string }[] = [
    { label: "Пользователи", value: stats.users, icon: <IconUser className="h-[18px] w-[18px]" />, chip: "bg-slate-100 text-slate-600" },
    { label: "Площадки", value: stats.venues, icon: <IconBuilding className="h-[18px] w-[18px]" />, chip: "bg-accent-50 text-accent-600" },
    { label: "События", value: stats.events, icon: <IconUsers className="h-[18px] w-[18px]" />, chip: "bg-brand-50 text-brand-700" },
    { label: "Заказы", value: stats.orders, icon: <IconTicket className="h-[18px] w-[18px]" />, chip: "bg-secondary-50 text-secondary-600" },
    {
      label: "Выручка",
      value: `${stats.revenue.toLocaleString("ru-RU")} ₽`,
      icon: <IconTrendingUp className="h-[18px] w-[18px]" />,
      chip: "bg-warning-50 text-warning-600",
    },
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Статистика платформы</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-start gap-3 p-5">
            <div className={`icon-chip ${c.chip}`}>{c.icon}</div>
            <div>
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="text-3xl font-bold tracking-tight">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3 mt-8 text-lg">Динамика за 14 дней</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Выручка по дням</span>
            <span className="font-semibold text-slate-900">
              {trend ? `${trend.reduce((s, t) => s + t.revenue, 0).toLocaleString("ru-RU")} ₽` : "…"}
            </span>
          </div>
          {trend ? <Sparkline values={trend.map((t) => t.revenue)} colorClassName="text-brand-500" /> : <div className="h-8" />}
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Заказы по дням</span>
            <span className="font-semibold text-slate-900">{trend ? trend.reduce((s, t) => s + t.orders, 0) : "…"}</span>
          </div>
          {trend ? <Sparkline values={trend.map((t) => t.orders)} colorClassName="text-secondary-500" /> : <div className="h-8" />}
        </div>
      </div>
    </div>
  );
}
