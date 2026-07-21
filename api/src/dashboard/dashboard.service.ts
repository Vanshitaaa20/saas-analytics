import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async assertMember(userId: string, orgId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this organization');
  }

  async getEventVolume(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);

    return this.prisma.rollup.findMany({
      where: { orgId, bucketType: 'hourly' },
      orderBy: { bucketAt: 'asc' },
      select: { bucketAt: true, eventName: true, count: true },
    });
  }

  async getTopEvents(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);

    const grouped = await this.prisma.event.groupBy({
      by: ['name'],
      where: { orgId },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 10,
    });

    return grouped.map((g) => ({ eventName: g.name, count: g._count.name }));
  }

  async getSummary(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);

    const totalEvents = await this.prisma.event.count({ where: { orgId } });
    const memberCount = await this.prisma.membership.count({ where: { orgId } });
    const org = await this.prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

    return {
      totalEvents,
      memberCount,
      planTier: org.planTier,
    };
  }
}