import type { EventFormat } from "./types";

export const FORMAT_LABELS: Record<EventFormat, string> = {
  TICKETED: "Билеты",
  VENUE_BOOKING: "Бронирование",
  MEETUP: "Любительское",
};

export const FORMAT_BADGE: Record<EventFormat, string> = {
  TICKETED: "badge-info",
  VENUE_BOOKING: "badge-accent",
  MEETUP: "badge-success",
};
