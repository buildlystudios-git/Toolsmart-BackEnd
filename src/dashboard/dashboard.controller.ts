import { BadRequestException, Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardActivityItem } from './interfaces/dashboard-activity-item.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('analytics')
  getAnalytics(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    return this.dashboardService.getAnalytics(year);
  }

  @Get('activity')
  getActivity(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<DashboardActivityItem[]> {
    return this.dashboardService.getRecentActivity(limit);
  }
}
