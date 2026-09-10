import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CitiesModule } from "./cities/cities.module";
import { SportTypesModule } from "./sport-types/sport-types.module";
import { VenuesModule } from "./venues/venues.module";
import { EventsModule } from "./events/events.module";
import { BookingsModule } from "./bookings/bookings.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { AdminModule } from "./admin/admin.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CitiesModule,
    SportTypesModule,
    VenuesModule,
    EventsModule,
    BookingsModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    FavoritesModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
