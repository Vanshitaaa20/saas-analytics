import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [OrgController],
  providers: [OrgService, RolesGuard, PrismaService],
})
export class OrgModule {}