import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { EventFormat } from "@prisma/client";

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  citySlug?: string;

  @IsOptional()
  @IsString()
  sportTypeId?: string;

  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

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
