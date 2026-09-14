import Link from "next/link";
import type { Venue } from "@/lib/types";
import { IconStar } from "./icons";
import { CardCover } from "./CardCover";

function avgRating(venue: Venue): number | null {
  if (!venue.reviews || venue.reviews.length === 0) return null;
  const sum = venue.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / venue.reviews.length) * 10) / 10;
}

export function VenueCard({ venue, className }: { venue: Venue; className?: string }) {
  const rating = avgRating(venue);
  const primarySport = venue.sportTypes?.[0]?.sportType;

  return (
    <Link href={`/venues/${venue.id}`} className={`card-interactive block overflow-hidden ${className ?? ""}`}>
      <CardCover src={venue.photos?.[0]} alt={venue.name} seed={venue.id} sportSlug={primarySport?.slug}>
        {rating && (
          <span className="badge-rating absolute right-2.5 top-2.5 backdrop-blur">
            <IconStar className="h-3 w-3" /> {rating}
          </span>
        )}
      </CardCover>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{venue.name}</h3>
        <div className="mt-0.5 text-xs text-slate-500">{venue.address}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {venue.sportTypes?.slice(0, 3).map((st) => (
            <span key={st.sportType.id} className="badge-success">
              {st.sportType.name}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end text-sm">
          <span className="font-semibold text-slate-900">{Number(venue.pricePerHour).toLocaleString("ru-RU")} ₽/час</span>
        </div>
      </div>
    </Link>
  );
}
