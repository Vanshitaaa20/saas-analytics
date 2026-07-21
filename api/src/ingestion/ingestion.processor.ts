import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('events')
export class IngestionProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    const { orgId, name, payload } = job.data;

    // Save the raw event
    await this.prisma.event.create({
      data: { orgId, name, payload },
    });

    // Update hourly rollup — bucket = start of current hour
    const now = new Date();
    const bucketAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    await this.prisma.rollup.upsert({
      where: {
        orgId_bucketType_bucketAt_eventName: {
          orgId,
          bucketType: 'hourly',
          bucketAt,
          eventName: name,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        orgId,
        bucketType: 'hourly',
        bucketAt,
        eventName: name,
        count: 1,
      },
    });
  }
}