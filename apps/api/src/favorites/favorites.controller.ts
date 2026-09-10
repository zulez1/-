import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FavoritesService } from "./favorites.service";
import { ToggleFavoriteDto } from "./dto/toggle-favorite.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user";

@ApiTags("favorites")
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post("toggle")
  toggle(@CurrentUser() user: AuthUser, @Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(user.id, dto);
  }
}
