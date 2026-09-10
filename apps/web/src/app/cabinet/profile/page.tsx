"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCity } from "@/lib/city-context";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { cities } = useCity();
  const [form, setForm] = useState({ name: "", phone: "", cityId: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "", cityId: user.cityId ?? "" });
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api("/users/me", { method: "PATCH", body: JSON.stringify(form) });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось обновить профиль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">Профиль</h1>
      <form className="card space-y-4 p-6" onSubmit={onSubmit}>
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50" value={user?.email ?? ""} disabled />
        </div>
        <div>
          <label className="label">Роль</label>
          <input
            className="input bg-slate-50"
            disabled
            value={{ USER: "Участник", ORGANIZER: "Организатор", ADMIN: "Администратор" }[user?.role ?? "USER"]}
          />
        </div>
        <div>
          <label className="label">Имя</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Телефон</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Профиль обновлён</p>}
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
