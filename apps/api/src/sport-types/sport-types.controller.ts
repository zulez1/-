import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SportTypesService } from "./sport-types.service";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("sport-types")
@Controller("sport-types")
export class SportTypesController {
  constructor(private readonly sportTypesService: SportTypesService) {}

  @Public()
  @Get()
  findAll() {
    return this.sportTypesService.findAll();
  }
}
