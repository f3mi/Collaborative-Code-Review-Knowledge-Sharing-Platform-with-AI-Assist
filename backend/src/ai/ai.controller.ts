import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(AuthGuard("jwt"))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("analyze")
  async analyzeCode(@Body() body: { code: string; language: string }) {
    return this.aiService.analyzeCode(body.code, body.language);
  }

  @Post("comment")
  async generateComment(@Body() body: { code: string; context: string }) {
    return this.aiService.generateReviewComment(body.code, body.context);
  }
}
