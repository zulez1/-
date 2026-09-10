import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SportTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sportType.findMany({ orderBy: { name: "asc" } });
  }
}
