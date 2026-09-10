import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CitiesService } from "./cities.service";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("cities")
@Controller("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Public()
  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @Public()
  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.citiesService.findBySlug(slug);
  }
}
