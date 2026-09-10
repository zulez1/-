import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, OrderStatus, PaymentStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForOrder(orderId: string, amount: number) {
    return this.prisma.payment.create({
      data: {
        orderId,
        amount,
        provider: "MOCK",
        status: PaymentStatus.PENDING,
      },
    });
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException("Платёж не найден");
    if (payment.order.userId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException("Нет доступа к этому платежу");
    }
    return payment;
  }

  /**
   * Эмулирует успешный вебхук платёжного провайдера (в реальной интеграции
   * сюда приходил бы webhook от ЮKassa/CloudPayments и т.п.).
   */
  async confirmMock(id: string, userId: string, role: UserRole) {
    const payment = await this.findOne(id, userId, role);
    if (payment.status === PaymentStatus.SUCCEEDED) return payment;

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.SUCCEEDED, externalId: `mock_${id}` },
      });

      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID },
      });

      if (order.bookingId) {
        await tx.booking.update({ where: { id: order.bookingId }, data: { status: BookingStatus.CONFIRMED } });
      }

      return updatedPayment;
    });
  }

  async failMock(id: string, userId: string, role: UserRole) {
    const payment = await this.findOne(id, userId, role);
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({ where: { id }, data: { status: PaymentStatus.FAILED } });
      const order = await tx.order.update({ where: { id: payment.orderId }, data: { status: OrderStatus.CANCELLED } });
      if (order.bookingId) {
        await tx.booking.update({ where: { id: order.bookingId }, data: { status: BookingStatus.CANCELLED } });
      }
      return updatedPayment;
    });
  }
}
