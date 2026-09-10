import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { EventFormat } from "@prisma/client";

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(EventFormat)
  format: EventFormat;

  @IsString()
  sportTypeId: string;

  @IsString()
  cityId: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ticketPrice?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}
