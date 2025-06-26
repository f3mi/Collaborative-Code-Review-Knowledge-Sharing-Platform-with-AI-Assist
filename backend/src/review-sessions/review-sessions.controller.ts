import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ReviewSessionsService } from "./review-sessions.service";
import { ReviewSession } from "./review-session.entity";

@Controller("review-sessions")
@UseGuards(AuthGuard("jwt"))
export class ReviewSessionsController {
  constructor(private readonly reviewSessionsService: ReviewSessionsService) {}

  @Get()
  async findByCreator(@Req() req: any) {
    return this.reviewSessionsService.findByCreatorId(req.user.id);
  }

  @Get("project/:projectId")
  async findByProject(@Param("projectId") projectId: string) {
    return this.reviewSessionsService.findByProjectId(projectId);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.reviewSessionsService.findById(id);
  }

  @Post()
  async create(@Body() sessionData: Partial<ReviewSession>, @Req() req: any) {
    return this.reviewSessionsService.create({
      ...sessionData,
      creatorId: req.user.id,
    });
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() sessionData: Partial<ReviewSession>
  ) {
    return this.reviewSessionsService.update(id, sessionData);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.reviewSessionsService.delete(id);
    return { message: "Review session deleted successfully" };
  }
}
