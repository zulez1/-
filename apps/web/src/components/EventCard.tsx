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
    <Link href={`/events/${event.id}`} className="card-interactive block p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="icon-chip bg-brand-50 text-brand-700">
          <SportIcon slug={event.sportType?.slug} className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{event.title}</h3>
            <span className={`badge shrink-0 ${FORMAT_COLORS[event.format]}`}>{FORMAT_LABELS[event.format]}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} в{" "}
            {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            {event.city && <> · {event.city.name}</>}
          </div>
        </div>
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-slate-500">{event.description}</p>
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
