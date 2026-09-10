import { Injectable } from "@nestjs/common";
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
      include: { city: true, sportTypes: { include: { sportType: true } } },
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
}
