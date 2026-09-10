import { IsDateString, IsString, Matches } from "class-validator";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateBookingDto {
  @IsString()
  venueId: string;

  @IsDateString()
  date: string;

  @Matches(TIME_PATTERN, { message: "startTime должен быть в формате HH:mm" })
  startTime: string;

  @Matches(TIME_PATTERN, { message: "endTime должен быть в формате HH:mm" })
  endTime: string;
}
