"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { VenueCard } from "@/components/VenueCard";
import { IconStarOutline } from "@/components/icons";
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

  if (loading) return <ListSkeleton />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Избранное</h1>
      {favorites.length === 0 ? (
        <EmptyState
          icon={<IconStarOutline className="h-6 w-6" />}
          title="Вы ещё ничего не добавили в избранное"
          description="Отмечайте понравившиеся события и площадки, чтобы быстро находить их здесь"
          actionLabel="Перейти в каталог"
          actionHref="/"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((f) => (f.venue ? <VenueCard key={f.id} venue={f.venue} /> : f.event ? <EventCard key={f.id} event={f.event} /> : null))}
        </div>
      )}
    </div>
  );
}
