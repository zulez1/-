import type { BookingStatus, EventStatus, VenueStatus } from "./types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Ожидает оплаты",
  CONFIRMED: "Подтверждено",
  CANCELLED: "Отменено",
  COMPLETED: "Завершено",
};

export const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge-success",
  CANCELLED: "badge-neutral",
  COMPLETED: "badge-neutral",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Черновик",
  PENDING_REVIEW: "На модерации",
  PUBLISHED: "Опубликовано",
  REJECTED: "Отклонено",
  CANCELLED: "Отменено",
  FINISHED: "Завершено",
};

export const EVENT_STATUS_BADGE: Record<EventStatus, string> = {
  DRAFT: "badge-neutral",
  PENDING_REVIEW: "badge-warning",
  PUBLISHED: "badge-success",
  REJECTED: "badge-danger",
  CANCELLED: "badge-neutral",
  FINISHED: "badge-neutral",
};

export const VENUE_STATUS_LABELS: Record<VenueStatus, string> = {
  PENDING_REVIEW: "На модерации",
  PUBLISHED: "Опубликована",
  REJECTED: "Отклонена",
  ARCHIVED: "В архиве",
};

export const VENUE_STATUS_BADGE: Record<VenueStatus, string> = {
  PENDING_REVIEW: "badge-warning",
  PUBLISHED: "badge-success",
  REJECTED: "badge-danger",
  ARCHIVED: "badge-neutral",
};
