import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class IngestionService {
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  async ingest(orgId: string, dto: CreateEventDto) {
    await this.eventsQueue.add('process-event', {
      orgId,
      name: dto.name,
      payload: dto.payload ?? null,
    });
    return { queued: true };
  }
}