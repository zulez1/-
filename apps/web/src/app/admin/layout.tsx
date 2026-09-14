"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/admin", label: "Статистика" },
  { href: "/admin/venues", label: "Модерация площадок" },
  { href: "/admin/events", label: "Модерация событий" },
  { href: "/admin/users", label: "Пользователи" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "ADMIN") router.push("/");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return <div className="py-20 text-center text-slate-400">Загрузка...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-3">
        <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Админ-панель</div>
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
