import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('event-volume')
  getEventVolume(@CurrentUser() user: any, @Param('orgId') orgId: string) {
    return this.dashboardService.getEventVolume(user.userId, orgId);
  }

  @Get('top-events')
  getTopEvents(@CurrentUser() user: any, @Param('orgId') orgId: string) {
    return this.dashboardService.getTopEvents(user.userId, orgId);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Param('orgId') orgId: string) {
    return this.dashboardService.getSummary(user.userId, orgId);
  }
}