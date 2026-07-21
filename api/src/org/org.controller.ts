import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateInviteDto } from './dto/invite.dto';

@UseGuards(JwtAuthGuard)
@Controller('orgs')
export class OrgController {
  constructor(private orgService: OrgService) {}

  @Post()
  createOrg(@CurrentUser() user: any, @Body() dto: CreateOrgDto) {
    return this.orgService.createOrg(user.userId, dto);
  }

  @Get(':orgId/members')
  getMembers(@CurrentUser() user: any, @Param('orgId') orgId: string) {
    return this.orgService.getMembers(user.userId, orgId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post(':orgId/invites')
  createInvite(@Param('orgId') orgId: string, @Body() dto: CreateInviteDto) {
    return this.orgService.createInvite(orgId, dto);
  }

  @Post('invites/accept')
  acceptInvite(@CurrentUser() user: any, @Body('token') token: string) {
    return this.orgService.acceptInvite(user.userId, token);
  }
}