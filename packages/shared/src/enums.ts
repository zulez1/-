export enum UserRole {
  USER = "USER",
  ORGANIZER = "ORGANIZER",
  ADMIN = "ADMIN",
}

export enum EventFormat {
  TICKETED = "TICKETED",
  VENUE_BOOKING = "VENUE_BOOKING",
  MEETUP = "MEETUP",
}

export enum EventStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  FINISHED = "FINISHED",
}

export enum VenueStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentProvider {
  MOCK = "MOCK",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}
