"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

  const cards = [
    { label: "Пользователи", value: stats.users },
    { label: "Площадки", value: stats.venues },
    { label: "События", value: stats.events },
    { label: "Заказы", value: stats.orders },
    { label: "Выручка", value: `${stats.revenue.toLocaleString("ru-RU")} ₽` },
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Статистика платформы</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
