"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { EventCard } from "@/components/EventCard";
import { VenueCard } from "@/components/VenueCard";
import type { EventItem, Venue } from "@/lib/types";

interface FavoriteItem {
  id: string;
  venue?: Venue | null;
  event?: EventItem | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<FavoriteItem[]>("/users/me/favorites")
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Избранное</h1>
      {favorites.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">Вы ещё ничего не добавили в избранное</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((f) => (f.venue ? <VenueCard key={f.id} venue={f.venue} /> : f.event ? <EventCard key={f.id} event={f.event} /> : null))}
        </div>
      )}
    </div>
  );
}
