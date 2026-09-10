import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  }

  findBySlug(slug: string) {
    return this.prisma.city.findUnique({ where: { slug } });
  }
}
