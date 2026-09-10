import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ToggleFavoriteDto } from "./dto/toggle-favorite.dto";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, dto: ToggleFavoriteDto) {
    if (!dto.venueId && !dto.eventId) {
      throw new BadRequestException("Нужно указать venueId или eventId");
    }

    const existing = await this.prisma.favorite.findFirst({
      where: { userId, venueId: dto.venueId ?? null, eventId: dto.eventId ?? null },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, venueId: dto.venueId, eventId: dto.eventId },
    });
    return { favorited: true };
  }
}
