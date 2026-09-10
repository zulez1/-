import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateTicketOrderDto } from "./dto/create-ticket-order.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("tickets")
  purchaseTickets(@CurrentUser() user: AuthUser, @Body() dto: CreateTicketOrderDto) {
    return this.ordersService.purchaseTickets(user.id, dto);
  }

  @Get()
  myOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.myOrders(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.ordersService.findOne(id, user.id, user.role);
  }
}
