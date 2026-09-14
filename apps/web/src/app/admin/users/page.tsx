"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/Avatar";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  createdAt: string;
}

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  USER: "Участник",
  ORGANIZER: "Организатор",
  ADMIN: "Администратор",
};

const ROLE_BADGE: Record<AdminUser["role"], string> = {
  USER: "badge-neutral",
  ORGANIZER: "badge-info",
  ADMIN: "badge-accent",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminUser[]>("/admin/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Пользователи ({users.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Пользователь</th>
              <th className="p-3">Email</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                <td className="flex items-center gap-2.5 p-3 font-medium">
                  <Avatar name={u.name} src={u.avatarUrl} size={28} />
                  {u.name}
                </td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3">
                  <span className={ROLE_BADGE[u.role]}>{ROLE_LABELS[u.role]}</span>
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
