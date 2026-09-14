import { Injectable } from "@nestjs/common";
import { OrderStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async myBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { venue: { include: { city: true } }, order: { include: { payment: true } } },
      orderBy: { date: "desc" },
    });
  }

  async myTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { order: { userId } },
      include: { event: { include: { city: true, venue: true } }, order: { include: { payment: true } } },
      orderBy: { id: "desc" },
    });
  }

  async myEvents(userId: string) {
    return this.prisma.event.findMany({
      where: { organizerId: userId },
      include: { city: true, sportType: true, venue: true, _count: { select: { tickets: true, participants: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async myVenues(userId: string) {
    return this.prisma.venue.findMany({
      where: { ownerId: userId },
      include: {
        city: true,
        sportTypes: { include: { sportType: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async myFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        venue: { include: { city: true } },
        event: { include: { city: true, sportType: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async myStats(userId: string, role: UserRole) {
    const [ticketsCount, bookingsCount, favoritesCount] = await Promise.all([
      this.prisma.ticket.count({ where: { order: { userId } } }),
      this.prisma.booking.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const base = { ticketsCount, bookingsCount, favoritesCount };
    if (role === UserRole.USER) return base;

    const [eventsCount, venuesCount, eventReviews, venueReviews, paidTickets, paidBookings, pendingVenues, pendingEvents] =
      await Promise.all([
        this.prisma.event.count({ where: { organizerId: userId } }),
        this.prisma.venue.count({ where: { ownerId: userId } }),
        this.prisma.review.findMany({ where: { event: { organizerId: userId } }, select: { rating: true } }),
        this.prisma.review.findMany({ where: { venue: { ownerId: userId } }, select: { rating: true } }),
        this.prisma.ticket.findMany({
          where: { event: { organizerId: userId }, order: { status: OrderStatus.PAID } },
          select: { price: true },
        }),
        this.prisma.booking.findMany({
          where: { venue: { ownerId: userId }, order: { status: OrderStatus.PAID } },
          select: { totalPrice: true },
        }),
        this.prisma.venue.count({ where: { ownerId: userId, status: "PENDING_REVIEW" } }),
        this.prisma.event.count({ where: { organizerId: userId, status: "PENDING_REVIEW" } }),
      ]);

    const ratings = [...eventReviews, ...venueReviews].map((r) => r.rating);
    const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
    const ticketRevenue = paidTickets.reduce((sum, t) => sum + Number(t.price), 0);
    const bookingRevenue = paidBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

    return {
      ...base,
      eventsCount,
      venuesCount,
      avgRating,
      reviewsCount: ratings.length,
      ticketsSold: paidTickets.length,
      revenue: ticketRevenue + bookingRevenue,
      pendingVenues,
      pendingEvents,
    };
  }
}
