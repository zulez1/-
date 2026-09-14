"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function CabinetOverviewPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight sm:text-4xl">Добро пожаловать, {user?.name}!</h1>
      <p className="mb-6 text-slate-500">Управляйте своими бронированиями, билетами и событиями.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/cabinet/bookings" className="card p-5 hover:shadow-md">
          <div className="mb-1 text-lg font-semibold">Бронирования</div>
          <p className="text-sm text-slate-500">Забронированные площадки и их статус оплаты</p>
        </Link>
        <Link href="/cabinet/tickets" className="card p-5 hover:shadow-md">
          <div className="mb-1 text-lg font-semibold">Билеты</div>
          <p className="text-sm text-slate-500">Купленные билеты на спортивные события</p>
        </Link>
        <Link href="/cabinet/events/new" className="card p-5 hover:shadow-md">
          <div className="mb-1 text-lg font-semibold">Создать событие</div>
          <p className="text-sm text-slate-500">Организуйте турнир, тренировку или любительскую встречу</p>
        </Link>
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
          <Link href="/cabinet/venues/new" className="card p-5 hover:shadow-md">
            <div className="mb-1 text-lg font-semibold">Добавить площадку</div>
            <p className="text-sm text-slate-500">Разместите свою спортивную площадку на карте</p>
          </Link>
        )}
        <Link href="/cabinet/favorites" className="card p-5 hover:shadow-md">
          <div className="mb-1 text-lg font-semibold">Избранное</div>
          <p className="text-sm text-slate-500">Сохранённые площадки и события</p>
        </Link>
        <Link href="/cabinet/profile" className="card p-5 hover:shadow-md">
          <div className="mb-1 text-lg font-semibold">Профиль</div>
          <p className="text-sm text-slate-500">Личные данные и настройки аккаунта</p>
        </Link>
      </div>
    </div>
  );
}
