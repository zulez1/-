"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CitySelector } from "./CitySelector";

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-brand-700">
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
