import { Type } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";

export class CreateTicketOrderDto {
  @IsString()
  eventId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
