import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/events')
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post()
  ingest(@Param('orgId') orgId: string, @Body() dto: CreateEventDto) {
    return this.ingestionService.ingest(orgId, dto);
  }
}