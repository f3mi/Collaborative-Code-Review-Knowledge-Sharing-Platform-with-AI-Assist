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
import { ProjectsService } from "./projects.service";
import { Project } from "./project.entity";

@Controller("projects")
@UseGuards(AuthGuard("jwt"))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findByOwner(@Req() req: any) {
    return this.projectsService.findByOwnerId(req.user.id);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  async create(@Body() projectData: Partial<Project>, @Req() req: any) {
    return this.projectsService.create({
      ...projectData,
      ownerId: req.user.id,
    });
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() projectData: Partial<Project>) {
    return this.projectsService.update(id, projectData);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.projectsService.delete(id);
    return { message: "Project deleted successfully" };
  }
}
