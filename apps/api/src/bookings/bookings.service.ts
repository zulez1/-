import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, OrderStatus, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const venue = await this.prisma.venue.findUnique({ where: { id: dto.venueId } });
    if (!venue || venue.status !== VenueStatus.PUBLISHED) {
      throw new NotFoundException("Площадка не найдена или недоступна для бронирования");
    }

    const startMinutes = timeToMinutes(dto.startTime);
    const endMinutes = timeToMinutes(dto.endTime);
    if (endMinutes <= startMinutes) {
      throw new BadRequestException("Время окончания должно быть позже времени начала");
    }
    if (startMinutes < timeToMinutes(venue.workingHoursStart) || endMinutes > timeToMinutes(venue.workingHoursEnd)) {
      throw new BadRequestException("Выбранное время вне рабочих часов площадки");
    }

    const dateOnly = new Date(dto.date);
    const existing = await this.prisma.booking.findMany({
      where: { venueId: dto.venueId, date: dateOnly, status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } },
    });
    const overlaps = existing.some((booking) => {
      const bookedStart = timeToMinutes(booking.startTime);
      const bookedEnd = timeToMinutes(booking.endTime);
      return startMinutes < bookedEnd && endMinutes > bookedStart;
    });
    if (overlaps) {
      throw new BadRequestException("Это время уже забронировано");
    }

    const hours = (endMinutes - startMinutes) / 60;
    const totalPrice = Number(venue.pricePerHour) * hours;

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          venueId: dto.venueId,
          userId,
          date: dateOnly,
          startTime: dto.startTime,
          endTime: dto.endTime,
          totalPrice,
          status: BookingStatus.PENDING,
        },
      });

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: totalPrice,
          status: OrderStatus.PENDING,
          bookingId: booking.id,
        },
      });

      const payment = await tx.payment.create({
        data: { orderId: order.id, amount: totalPrice, status: "PENDING", provider: "MOCK" },
      });

      return { booking, order, payment };
    });

    return result;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { order: true } });
    if (!booking) throw new NotFoundException("Бронирование не найдено");
    if (booking.userId !== userId) throw new ForbiddenException("Нет доступа к этому бронированию");

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({ where: { id }, data: { status: BookingStatus.CANCELLED } });
      if (booking.order) {
        await tx.order.update({ where: { id: booking.order.id }, data: { status: OrderStatus.CANCELLED } });
      }
      return updated;
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { venue: { include: { city: true } }, order: { include: { payment: true } } },
    });
    if (!booking) throw new NotFoundException("Бронирование не найдено");
    if (booking.userId !== userId) throw new ForbiddenException("Нет доступа к этому бронированию");
    return booking;
  }
}
