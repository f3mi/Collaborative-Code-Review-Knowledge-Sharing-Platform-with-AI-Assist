import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "./project.entity";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async findById(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ["owner"],
    });
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { ownerId },
      relations: ["owner"],
    });
  }

  async create(projectData: Partial<Project>): Promise<Project> {
    const project = this.projectRepository.create(projectData);
    return this.projectRepository.save(project);
  }

  async update(
    id: string,
    projectData: Partial<Project>
  ): Promise<Project | null> {
    await this.projectRepository.update(id, projectData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
