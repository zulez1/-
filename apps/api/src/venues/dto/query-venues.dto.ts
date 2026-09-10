import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class QueryVenuesDto {
  @IsOptional()
  @IsString()
  citySlug?: string;

  @IsOptional()
  @IsString()
  sportTypeId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLng?: number;
}
