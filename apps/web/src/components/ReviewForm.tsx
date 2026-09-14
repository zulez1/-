"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { IconStar, IconStarOutline } from "./icons";

export function ReviewForm({
  venueId,
  eventId,
  onSubmitted,
}: {
  venueId?: string;
  eventId?: string;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <button className="btn-outline" onClick={() => router.push("/login")}>
        Войдите, чтобы оставить отзыв
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api("/reviews", {
        method: "POST",
        body: JSON.stringify({ venueId, eventId, rating, comment: comment || undefined }),
      });
      setComment("");
      setRating(5);
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card space-y-3 p-4" onSubmit={submit}>
      <div>
        <span className="label">Ваша оценка</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} из 5`}>
              {value <= rating ? (
                <IconStar className="h-6 w-6 text-amber-500" />
              ) : (
                <IconStarOutline className="h-6 w-6 text-slate-300" />
              )}
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="Расскажите о своём опыте (необязательно)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Отправляем..." : "Оставить отзыв"}
      </button>
    </form>
  );
}
