"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CitySelector } from "./CitySelector";
import { IconActivity } from "./icons";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium ${pathname === href ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-brand-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-emerald-500 text-white">
              <IconActivity className="h-[18px] w-[18px]" />
            </span>
            СпортМаркет
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navLink("/", "События и площадки")}
            {user?.role === "ADMIN" && navLink("/admin", "Админка")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CitySelector />
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/cabinet" className="btn-outline">
                {user.name.split(" ")[0]}
              </Link>
              <button
                className="btn-secondary"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-outline">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
