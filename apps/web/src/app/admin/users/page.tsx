"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
  createdAt: string;
}

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  USER: "Участник",
  ORGANIZER: "Организатор",
  ADMIN: "Администратор",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminUser[]>("/admin/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Пользователи ({users.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Имя</th>
              <th className="p-3">Email</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3">
                  <span className="badge bg-slate-100 text-slate-700">{ROLE_LABELS[u.role]}</span>
                </td>
                <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
