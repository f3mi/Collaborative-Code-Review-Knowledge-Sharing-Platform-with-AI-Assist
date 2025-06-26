import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}
