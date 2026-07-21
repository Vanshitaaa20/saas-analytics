import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_LIMITS = { FREE: 1000, PRO: 100000 };

@Injectable()
export class IngestionService {
  constructor(
    @InjectQueue('events') private eventsQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async ingest(orgId: string, dto: CreateEventDto) {
    const org = await this.prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.event.count({
      where: { orgId, createdAt: { gte: startOfDay } },
    });

    const limit = PLAN_LIMITS[org.planTier];
    if (todayCount >= limit) {
      throw new ForbiddenException(`Daily event limit (${limit}) reached for ${org.planTier} plan`);
    }

    await this.eventsQueue.add('process-event', {
      orgId,
      name: dto.name,
      payload: dto.payload ?? null,
    });
    return { queued: true };
  }
}