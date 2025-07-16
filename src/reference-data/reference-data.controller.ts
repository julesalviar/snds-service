import { Controller, Get, Query } from '@nestjs/common';
import { ReferenceDataService } from 'src/reference-data/reference-data.service';
import { StatusQueryDto } from 'src/reference-data/status-query.dto';

@Controller('reference-data')
export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  @Get()
  async getReferenceData(@Query() query: StatusQueryDto) {
    const status = query.status ?? 'active';
    return this.referenceDataService.getByStatus(status);
  }
}
