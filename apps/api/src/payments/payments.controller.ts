import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.paymentsService.findOne(id, user.id, user.role);
  }

  @Post(":id/confirm")
  confirm(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.paymentsService.confirmMock(id, user.id, user.role);
  }

  @Post(":id/fail")
  fail(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.paymentsService.failMock(id, user.id, user.role);
  }
}
