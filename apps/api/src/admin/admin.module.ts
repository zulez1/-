import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { VenuesModule } from "../venues/venues.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [VenuesModule, EventsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
