"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/cabinet", label: "Обзор" },
  { href: "/cabinet/bookings", label: "Мои бронирования" },
  { href: "/cabinet/tickets", label: "Мои билеты" },
  { href: "/cabinet/events", label: "Мои события" },
  { href: "/cabinet/venues", label: "Мои площадки" },
  { href: "/cabinet/favorites", label: "Избранное" },
  { href: "/cabinet/profile", label: "Профиль" },
];

export default function CabinetLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return <div className="py-20 text-center text-slate-400">Загрузка личного кабинета...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-3">
        <div className="mb-3 px-2 py-1">
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs text-slate-400">{user.email}</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm ${
                pathname === item.href ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
