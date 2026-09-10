import { Module } from "@nestjs/common";
import { SportTypesService } from "./sport-types.service";
import { SportTypesController } from "./sport-types.controller";

@Module({
  providers: [SportTypesService],
  controllers: [SportTypesController],
  exports: [SportTypesService],
})
export class SportTypesModule {}
