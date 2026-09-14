import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { FORMAT_BADGE, FORMAT_LABELS } from "@/lib/format";
import { CardCover } from "./CardCover";

export function EventCard({ event, className }: { event: EventItem; className?: string }) {
  const date = new Date(event.startsAt);

  return (
    <Link href={`/events/${event.id}`} className={`card-interactive block overflow-hidden ${className ?? ""}`}>
      <CardCover src={event.coverImage} alt={event.title} seed={event.id} sportSlug={event.sportType?.slug}>
        <span className={`${FORMAT_BADGE[event.format]} absolute left-2.5 top-2.5 backdrop-blur`}>
          {FORMAT_LABELS[event.format]}
        </span>
      </CardCover>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{event.title}</h3>
        <div className="mt-0.5 text-xs text-slate-500">
          {date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} в{" "}
          {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          {event.city && <> · {event.city.name}</>}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{event.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {event._count?.tickets !== undefined || event._count?.participants !== undefined
              ? `${(event._count?.tickets ?? 0) + (event._count?.participants ?? 0)}${event.capacity ? ` / ${event.capacity}` : ""} участников`
              : ""}
          </span>
          <span className="font-semibold text-slate-900">
            {event.isFree ? "Бесплатно" : event.ticketPrice ? `${Number(event.ticketPrice).toLocaleString("ru-RU")} ₽` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
