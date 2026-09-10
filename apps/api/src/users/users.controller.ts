import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user";

@ApiTags("users")
@Controller("users/me")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get("bookings")
  myBookings(@CurrentUser() user: AuthUser) {
    return this.usersService.myBookings(user.id);
  }

  @Get("tickets")
  myTickets(@CurrentUser() user: AuthUser) {
    return this.usersService.myTickets(user.id);
  }

  @Get("events")
  myEvents(@CurrentUser() user: AuthUser) {
    return this.usersService.myEvents(user.id);
  }

  @Get("venues")
  myVenues(@CurrentUser() user: AuthUser) {
    return this.usersService.myVenues(user.id);
  }

  @Get("favorites")
  myFavorites(@CurrentUser() user: AuthUser) {
    return this.usersService.myFavorites(user.id);
  }
}
