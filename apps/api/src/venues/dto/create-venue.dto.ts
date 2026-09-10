import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateVenueDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  address: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsString()
  cityId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sportTypeIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  workingHoursStart?: string;

  @IsOptional()
  @IsString()
  workingHoursEnd?: string;
}
