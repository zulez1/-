import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { QueryVenuesDto } from "./dto/query-venues.dto";

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryVenuesDto) {
    const where: Record<string, unknown> = { status: VenueStatus.PUBLISHED };

    if (query.citySlug) {
      where.city = { slug: query.citySlug };
    }
    if (query.sportTypeId) {
      where.sportTypes = { some: { sportTypeId: query.sportTypeId } };
    }
    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }
    if (query.minLat !== undefined && query.maxLat !== undefined) {
      where.lat = { gte: query.minLat, lte: query.maxLat };
    }
    if (query.minLng !== undefined && query.maxLng !== undefined) {
      where.lng = { gte: query.minLng, lte: query.maxLng };
    }

    return this.prisma.venue.findMany({
      where,
      include: {
        city: true,
        sportTypes: { include: { sportType: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: {
        city: true,
        owner: { select: { id: true, name: true, avatarUrl: true } },
        sportTypes: { include: { sportType: true } },
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!venue) throw new NotFoundException("Площадка не найдена");
    return venue;
  }

  async create(ownerId: string, dto: CreateVenueDto) {
    const { sportTypeIds, ...rest } = dto;
    return this.prisma.venue.create({
      data: {
        ...rest,
        ownerId,
        status: VenueStatus.PENDING_REVIEW,
        sportTypes: {
          create: sportTypeIds.map((sportTypeId) => ({ sportTypeId })),
        },
      },
      include: { sportTypes: { include: { sportType: true } } },
    });
  }

  async update(id: string, userId: string, role: UserRole, dto: UpdateVenueDto) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException("Площадка не найдена");
    if (venue.ownerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException("Нет доступа к редактированию этой площадки");
    }

    const { sportTypeIds, ...rest } = dto;
    return this.prisma.venue.update({
      where: { id },
      data: {
        ...rest,
        status: role === UserRole.ADMIN ? venue.status : VenueStatus.PENDING_REVIEW,
        ...(sportTypeIds
          ? {
              sportTypes: {
                deleteMany: {},
                create: sportTypeIds.map((sportTypeId) => ({ sportTypeId })),
              },
            }
          : {}),
      },
      include: { sportTypes: { include: { sportType: true } } },
    });
  }

  listPending() {
    return this.prisma.venue.findMany({
      where: { status: VenueStatus.PENDING_REVIEW },
      include: { city: true, owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  approve(id: string) {
    return this.prisma.venue.update({ where: { id }, data: { status: VenueStatus.PUBLISHED, rejectionReason: null } });
  }

  reject(id: string, reason?: string) {
    return this.prisma.venue.update({
      where: { id },
      data: { status: VenueStatus.REJECTED, rejectionReason: reason ?? "Не прошла модерацию" },
    });
  }

  async availability(venueId: string, date: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException("Площадка не найдена");

    const bookings = await this.prisma.booking.findMany({
      where: {
        venueId,
        date: new Date(date),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startTime: true, endTime: true },
    });

    return { workingHoursStart: venue.workingHoursStart, workingHoursEnd: venue.workingHoursEnd, bookedSlots: bookings };
  }
}
