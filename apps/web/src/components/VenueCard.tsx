import Link from "next/link";
import type { Venue } from "@/lib/types";
import { IconStar, SportIcon } from "./icons";

function avgRating(venue: Venue): number | null {
  if (!venue.reviews || venue.reviews.length === 0) return null;
  const sum = venue.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / venue.reviews.length) * 10) / 10;
}

export function VenueCard({ venue }: { venue: Venue }) {
  const rating = avgRating(venue);

  return (
    <Link href={`/venues/${venue.id}`} className="card block p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{venue.name}</h3>
        {rating && (
          <span className="badge bg-amber-100 text-amber-800">
            <IconStar className="h-3 w-3" /> {rating}
          </span>
        )}
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-slate-500">{venue.description}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {venue.sportTypes?.map((st) => (
          <span key={st.sportType.id} className="badge bg-brand-50 text-brand-700">
            <SportIcon slug={st.sportType.slug} className="h-3 w-3" /> {st.sportType.name}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{venue.address}</span>
        <span className="font-semibold text-slate-900">{Number(venue.pricePerHour).toLocaleString("ru-RU")} ₽/час</span>
      </div>
    </Link>
  );
}
