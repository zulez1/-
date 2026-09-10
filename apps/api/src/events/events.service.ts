import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { EventFormat, EventStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { QueryEventsDto } from "./dto/query-events.dto";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryEventsDto) {
    const where: Record<string, unknown> = { status: EventStatus.PUBLISHED };

    if (query.citySlug) where.city = { slug: query.citySlug };
    if (query.sportTypeId) where.sportTypeId = query.sportTypeId;
    if (query.format) where.format = query.format;
    if (query.search) where.title = { contains: query.search, mode: "insensitive" };
    if (query.dateFrom || query.dateTo) {
      where.startsAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }
    if (query.minLat !== undefined && query.maxLat !== undefined) {
      where.lat = { gte: query.minLat, lte: query.maxLat };
    }
    if (query.minLng !== undefined && query.maxLng !== undefined) {
      where.lng = { gte: query.minLng, lte: query.maxLng };
    }

    return this.prisma.event.findMany({
      where,
      include: {
        city: true,
        sportType: true,
        venue: true,
        organizer: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { tickets: true, participants: true } },
      },
      orderBy: { startsAt: "asc" },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        city: true,
        sportType: true,
        venue: true,
        organizer: { select: { id: true, name: true, avatarUrl: true } },
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" } },
        _count: { select: { tickets: true, participants: true } },
      },
    });
    if (!event) throw new NotFoundException("Событие не найдено");
    return event;
  }

  create(organizerId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        organizerId,
        status: EventStatus.PENDING_REVIEW,
      },
    });
  }

  async update(id: string, userId: string, role: UserRole, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Событие не найдено");
    if (event.organizerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException("Нет доступа к редактированию этого события");
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startsAt ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt ? { endsAt: new Date(dto.endsAt) } : {}),
        status: role === UserRole.ADMIN ? event.status : EventStatus.PENDING_REVIEW,
      },
    });
  }

  async cancel(id: string, userId: string, role: UserRole) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Событие не найдено");
    if (event.organizerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException("Нет доступа к отмене этого события");
    }
    return this.prisma.event.update({ where: { id }, data: { status: EventStatus.CANCELLED } });
  }

  async join(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { participants: true } } } });
    if (!event) throw new NotFoundException("Событие не найдено");
    if (event.format !== EventFormat.MEETUP) {
      throw new ConflictException("Присоединиться можно только к любительским мероприятиям");
    }
    if (event.capacity && event._count.participants >= event.capacity) {
      throw new ConflictException("Свободных мест не осталось");
    }

    return this.prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId },
      update: {},
    });
  }

  async leave(eventId: string, userId: string) {
    await this.prisma.eventParticipant.deleteMany({ where: { eventId, userId } });
    return { success: true };
  }

  listPending() {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PENDING_REVIEW },
      include: { city: true, sportType: true, organizer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  approve(id: string) {
    return this.prisma.event.update({ where: { id }, data: { status: EventStatus.PUBLISHED, rejectionReason: null } });
  }

  reject(id: string, reason?: string) {
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.REJECTED, rejectionReason: reason ?? "Не прошло модерацию" },
    });
  }
}
