import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus, OrderStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTicketOrderDto } from "./dto/create-ticket-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseTickets(userId: string, dto: CreateTicketOrderDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { _count: { select: { tickets: true } } },
    });
    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException("Событие не найдено или недоступно");
    }
    if (event.capacity && event._count.tickets + dto.quantity > event.capacity) {
      throw new BadRequestException("Недостаточно свободных билетов");
    }

    const unitPrice = event.isFree ? 0 : Number(event.ticketPrice ?? 0);
    const totalAmount = unitPrice * dto.quantity;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { userId, totalAmount, status: OrderStatus.PENDING },
      });

      await tx.ticket.createMany({
        data: Array.from({ length: dto.quantity }).map(() => ({
          eventId: dto.eventId,
          orderId: order.id,
          price: unitPrice,
        })),
      });

      const payment = await tx.payment.create({
        data: { orderId: order.id, amount: totalAmount, status: "PENDING", provider: "MOCK" },
      });

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { tickets: { include: { event: true } }, payment: true },
      });

      return { order: fullOrder, payment };
    });
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        tickets: { include: { event: true } },
        booking: { include: { venue: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException("Заказ не найден");
    if (order.userId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException("Нет доступа к этому заказу");
    }
    return order;
  }

  myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { tickets: { include: { event: true } }, booking: { include: { venue: true } }, payment: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
