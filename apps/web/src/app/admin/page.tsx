"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { IconBuilding, IconTicket, IconTrendingUp, IconUser, IconUsers } from "@/components/icons";

interface Stats {
  users: number;
  venues: number;
  events: number;
  orders: number;
  revenue: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats);
  }, []);

  if (!stats) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  const cards: { label: string; value: string | number; icon: ReactNode; chip: string }[] = [
    { label: "Пользователи", value: stats.users, icon: <IconUser className="h-[18px] w-[18px]" />, chip: "bg-slate-100 text-slate-600" },
    { label: "Площадки", value: stats.venues, icon: <IconBuilding className="h-[18px] w-[18px]" />, chip: "bg-accent-50 text-accent-600" },
    { label: "События", value: stats.events, icon: <IconUsers className="h-[18px] w-[18px]" />, chip: "bg-brand-50 text-brand-700" },
    { label: "Заказы", value: stats.orders, icon: <IconTicket className="h-[18px] w-[18px]" />, chip: "bg-purple-50 text-purple-600" },
    {
      label: "Выручка",
      value: `${stats.revenue.toLocaleString("ru-RU")} ₽`,
      icon: <IconTrendingUp className="h-[18px] w-[18px]" />,
      chip: "bg-blue-50 text-blue-600",
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
    </div>
  );
}
