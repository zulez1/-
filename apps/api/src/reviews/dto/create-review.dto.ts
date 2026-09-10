import { IsInt, IsOptional, IsString, Max, Min, ValidateIf } from "class-validator";

export class CreateReviewDto {
  @ValidateIf((dto) => !dto.eventId)
  @IsString()
  venueId?: string;

  @ValidateIf((dto) => !dto.venueId)
  @IsString()
  eventId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
