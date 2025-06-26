import { Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getStats(userId: string) {
    // In a real application, you would fetch actual statistics
    return {
      totalProjects: 0,
      activeSessions: 0,
      completedReviews: 0,
      recentActivity: [],
    };
  }

  async getRecentActivity(userId: string) {
    // In a real application, you would fetch actual recent activity
    return [];
  }
}
