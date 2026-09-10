import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AdminService } from "./admin.service";
import { VenuesService } from "../venues/venues.service";
import { EventsService } from "../events/events.service";
import { RejectVenueDto } from "../venues/dto/moderate-venue.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@ApiTags("admin")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly venuesService: VenuesService,
    private readonly eventsService: EventsService,
  ) {}

  @Get("stats")
  stats() {
    return this.adminService.stats();
  }

  @Get("users")
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get("venues/pending")
  pendingVenues() {
    return this.venuesService.listPending();
  }

  @Post("venues/:id/approve")
  approveVenue(@Param("id") id: string) {
    return this.venuesService.approve(id);
  }

  @Post("venues/:id/reject")
  rejectVenue(@Param("id") id: string, @Body() dto: RejectVenueDto) {
    return this.venuesService.reject(id, dto.reason);
  }

  @Get("events/pending")
  pendingEvents() {
    return this.eventsService.listPending();
  }

  @Post("events/:id/approve")
  approveEvent(@Param("id") id: string) {
    return this.eventsService.approve(id);
  }

  @Post("events/:id/reject")
  rejectEvent(@Param("id") id: string, @Body() dto: RejectVenueDto) {
    return this.eventsService.reject(id, dto.reason);
  }
}
