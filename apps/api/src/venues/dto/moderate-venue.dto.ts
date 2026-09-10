import { IsOptional, IsString } from "class-validator";

export class RejectVenueDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
