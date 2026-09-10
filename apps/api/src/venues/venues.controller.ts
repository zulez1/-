import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { VenuesService } from "./venues.service";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { QueryVenuesDto } from "./dto/query-venues.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user";

@ApiTags("venues")
@Controller("venues")
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryVenuesDto) {
    return this.venuesService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.venuesService.findOne(id);
  }

  @Public()
  @Get(":id/availability")
  availability(@Param("id") id: string, @Query("date") date: string) {
    return this.venuesService.availability(id, date);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVenueDto) {
    return this.venuesService.create(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, user.id, user.role, dto);
  }
}
