export type UserRole = "USER" | "ORGANIZER" | "ADMIN";
export type EventFormat = "TICKETED" | "VENUE_BOOKING" | "MEETUP";
export type EventStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "CANCELLED" | "FINISHED";
export type VenueStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  cityId?: string | null;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface SportType {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  cityId: string;
  city?: City;
  ownerId: string;
  status: VenueStatus;
  pricePerHour: string;
  amenities: string[];
  photos: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  rejectionReason?: string | null;
  sportTypes?: { sportType: SportType }[];
  reviews?: { rating: number }[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  format: EventFormat;
  status: EventStatus;
  sportTypeId: string;
  sportType?: SportType;
  cityId: string;
  city?: City;
  organizerId: string;
  organizer?: { id: string; name: string; avatarUrl?: string | null };
  venueId?: string | null;
  venue?: Venue | null;
  address?: string | null;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt: string;
  coverImage?: string | null;
  capacity?: number | null;
  ticketPrice?: string | null;
  isFree: boolean;
  rejectionReason?: string | null;
  _count?: { tickets: number; participants: number };
  participants?: { user: { id: string; name: string; avatarUrl?: string | null } }[];
}

export interface Booking {
  id: string;
  venueId: string;
  venue?: Venue;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  status: BookingStatus;
  order?: Order | null;
}

export interface Ticket {
  id: string;
  eventId: string;
  event?: EventItem;
  orderId: string;
  price: string;
  qrCode: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  status: PaymentStatus;
  amount: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  bookingId?: string | null;
  booking?: Booking | null;
  tickets?: Ticket[];
  payment?: Payment | null;
}
