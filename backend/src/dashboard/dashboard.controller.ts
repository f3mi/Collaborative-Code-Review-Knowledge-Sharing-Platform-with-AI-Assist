import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(AuthGuard("jwt"))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  async getStats(@Req() req: any) {
    return this.dashboardService.getStats(req.user.id);
  }

  @Get("activity")
  async getRecentActivity(@Req() req: any) {
    return this.dashboardService.getRecentActivity(req.user.id);
  }
}
