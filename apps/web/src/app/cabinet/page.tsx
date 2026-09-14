"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { IconBuilding, IconCalendar, IconPlus, IconStarOutline, IconTicket, IconUser } from "@/components/icons";

export default function CabinetOverviewPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight sm:text-4xl">Добро пожаловать, {user?.name}!</h1>
      <p className="mb-6 text-slate-500">Управляйте своими бронированиями, билетами и событиями.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/cabinet/bookings" className="card-interactive flex items-start gap-3 p-5">
          <div className="icon-chip bg-blue-50 text-blue-600">
            <IconCalendar className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Бронирования</div>
            <p className="text-sm text-slate-500">Забронированные площадки и их статус оплаты</p>
          </div>
        </Link>
        <Link href="/cabinet/tickets" className="card-interactive flex items-start gap-3 p-5">
          <div className="icon-chip bg-purple-50 text-purple-600">
            <IconTicket className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Билеты</div>
            <p className="text-sm text-slate-500">Купленные билеты на спортивные события</p>
          </div>
        </Link>
        <Link href="/cabinet/events/new" className="card-interactive flex items-start gap-3 p-5">
          <div className="icon-chip bg-brand-50 text-brand-700">
            <IconPlus className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Создать событие</div>
            <p className="text-sm text-slate-500">Организуйте турнир, тренировку или любительскую встречу</p>
          </div>
        </Link>
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
          <Link href="/cabinet/venues/new" className="card-interactive flex items-start gap-3 p-5">
            <div className="icon-chip bg-accent-50 text-accent-600">
              <IconBuilding className="h-[18px] w-[18px]" />
            </div>
            <div>
              <div className="mb-1 font-semibold text-slate-900">Добавить площадку</div>
              <p className="text-sm text-slate-500">Разместите свою спортивную площадку на карте</p>
            </div>
          </Link>
        )}
        <Link href="/cabinet/favorites" className="card-interactive flex items-start gap-3 p-5">
          <div className="icon-chip bg-amber-50 text-amber-600">
            <IconStarOutline className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Избранное</div>
            <p className="text-sm text-slate-500">Сохранённые площадки и события</p>
          </div>
        </Link>
        <Link href="/cabinet/profile" className="card-interactive flex items-start gap-3 p-5">
          <div className="icon-chip bg-slate-100 text-slate-600">
            <IconUser className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Профиль</div>
            <p className="text-sm text-slate-500">Личные данные и настройки аккаунта</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
