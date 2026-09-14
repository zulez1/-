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

  /** Real daily aggregates from Order.createdAt — no fabricated data, just sparse if the demo dataset is young. */
  async trend(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, totalAmount: true, status: true },
    });

    const buckets = new Map<string, { orders: number; revenue: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), { orders: 0, revenue: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.status === "PAID") bucket.revenue += Number(order.totalAmount);
    }

    return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }));
  }
}
