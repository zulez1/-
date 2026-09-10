"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { useCity } from "@/lib/city-context";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const { cities } = useCity();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" as UserRole, cityId: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        cityId: form.cityId || undefined,
      });
      router.push("/cabinet");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold">Регистрация</h1>
        <p className="mb-6 text-sm text-slate-500">Создайте аккаунт, чтобы покупать билеты, бронировать площадки и организовывать события.</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Имя</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input
              className="input"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Город</label>
            <select className="input" value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
              <option value="">Не выбран</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Тип аккаунта</label>
            <div className="flex gap-3">
              <button
                type="button"
                className={form.role === "USER" ? "btn-primary" : "btn-outline"}
                onClick={() => setForm({ ...form, role: "USER" })}
              >
                Участник
              </button>
              <button
                type="button"
                className={form.role === "ORGANIZER" ? "btn-primary" : "btn-outline"}
                onClick={() => setForm({ ...form, role: "ORGANIZER" })}
              >
                Организатор / владелец площадки
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Уже есть аккаунт?{" "}
          <Link className="font-medium text-brand-700" href="/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
