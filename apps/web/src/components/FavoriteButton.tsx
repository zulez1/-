"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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
      {favorited ? "★ В избранном" : "☆ В избранное"}
    </button>
  );
}
