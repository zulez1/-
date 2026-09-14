import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { SportIcon } from "./icons";

const FORMAT_LABELS: Record<EventItem["format"], string> = {
  TICKETED: "Билеты",
  VENUE_BOOKING: "Бронирование",
  MEETUP: "Любительское",
};

const FORMAT_COLORS: Record<EventItem["format"], string> = {
  TICKETED: "bg-blue-50 text-blue-700",
  VENUE_BOOKING: "bg-purple-50 text-purple-700",
  MEETUP: "bg-emerald-50 text-emerald-700",
};

export function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.startsAt);

  return (
    <Link href={`/events/${event.id}`} className="card block p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{event.title}</h3>
        <span className={`badge ${FORMAT_COLORS[event.format]}`}>{FORMAT_LABELS[event.format]}</span>
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-slate-500">{event.description}</p>
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        {event.sportType && (
          <span className="badge bg-brand-50 text-brand-700">
            <SportIcon slug={event.sportType.slug} className="h-3 w-3" /> {event.sportType.name}
          </span>
        )}
        <span>
          {date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} в{" "}
          {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {event.city && <span>· {event.city.name}</span>}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {event._count?.tickets !== undefined || event._count?.participants !== undefined
            ? `${(event._count?.tickets ?? 0) + (event._count?.participants ?? 0)}${event.capacity ? ` / ${event.capacity}` : ""} участников`
            : ""}
        </span>
        <span className="font-semibold text-slate-900">
          {event.isFree ? "Бесплатно" : event.ticketPrice ? `${Number(event.ticketPrice).toLocaleString("ru-RU")} ₽` : ""}
        </span>
      </div>
    </Link>
  );
}
