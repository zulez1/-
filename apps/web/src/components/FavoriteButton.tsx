"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { IconStar, IconStarOutline } from "./icons";

export function FavoriteButton({ venueId, eventId }: { venueId?: string; eventId?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const result = await api<{ favorited: boolean }>("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ venueId, eventId }),
      });
      setFavorited(result.favorited);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn-outline" disabled={loading} onClick={toggle}>
      {favorited ? <IconStar className="h-4 w-4 text-amber-500" /> : <IconStarOutline className="h-4 w-4" />}
      {favorited ? "В избранном" : "В избранное"}
    </button>
  );
}
