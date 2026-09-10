import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, cityId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async stats() {
    const [users, venues, events, orders, paidOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.venue.count(),
      this.prisma.event.count(),
      this.prisma.order.count(),
      this.prisma.order.findMany({ where: { status: "PAID" }, select: { totalAmount: true } }),
    ]);

    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return { users, venues, events, orders, revenue };
  }
}
