import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateReviewDto) {
    if (!dto.venueId && !dto.eventId) {
      throw new BadRequestException("Нужно указать venueId или eventId");
    }
    return this.prisma.review.create({
      data: {
        userId,
        venueId: dto.venueId,
        eventId: dto.eventId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  remove(id: string, userId: string) {
    return this.prisma.review.deleteMany({ where: { id, userId } });
  }
}
