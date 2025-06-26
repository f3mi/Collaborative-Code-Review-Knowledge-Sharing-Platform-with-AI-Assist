import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewSessionsController } from "./review-sessions.controller";
import { ReviewSessionsService } from "./review-sessions.service";
import { ReviewSession } from "./review-session.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReviewSession])],
  controllers: [ReviewSessionsController],
  providers: [ReviewSessionsService],
  exports: [ReviewSessionsService],
})
export class ReviewSessionsModule {}
