import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReviewSession } from "./review-session.entity";

@Injectable()
export class ReviewSessionsService {
  constructor(
    @InjectRepository(ReviewSession)
    private readonly reviewSessionRepository: Repository<ReviewSession>
  ) {}

  async findById(id: string): Promise<ReviewSession | null> {
    return this.reviewSessionRepository.findOne({
      where: { id },
      relations: ["project", "creator"],
    });
  }

  async findByProjectId(projectId: string): Promise<ReviewSession[]> {
    return this.reviewSessionRepository.find({
      where: { projectId },
      relations: ["project", "creator"],
    });
  }

  async findByCreatorId(creatorId: string): Promise<ReviewSession[]> {
    return this.reviewSessionRepository.find({
      where: { creatorId },
      relations: ["project", "creator"],
    });
  }

  async create(sessionData: Partial<ReviewSession>): Promise<ReviewSession> {
    const session = this.reviewSessionRepository.create(sessionData);
    return this.reviewSessionRepository.save(session);
  }

  async update(
    id: string,
    sessionData: Partial<ReviewSession>
  ): Promise<ReviewSession | null> {
    await this.reviewSessionRepository.update(id, sessionData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.reviewSessionRepository.delete(id);
  }
}
