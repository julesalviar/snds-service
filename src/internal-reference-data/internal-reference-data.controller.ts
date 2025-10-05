import { Controller, Get, Query } from '@nestjs/common';
import { InternalReferenceDataService } from 'src/internal-reference-data/internal-reference-data.service';
import { StatusQueryDto } from 'src/reference-data/status-query.dto';

@Controller('internal-reference-data')
export class InternalReferenceDataController {
  constructor(
    private readonly internalReferenceDataService: InternalReferenceDataService,
  ) {}

  @Get()
  async getInternalReferenceData(@Query() query: StatusQueryDto) {
    const status = query.status ?? 'active';
    return this.internalReferenceDataService.getByStatus(status);
  }
}
