import { IsOptional, IsString } from "class-validator";

export class ToggleFavoriteDto {
  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}
