import { Controller, Get, Query, Param } from '@nestjs/common';
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

  @Get(':key')
  async getInternalReferenceDataByKey(
    @Param('key') key: string,
    @Query() query: StatusQueryDto,
  ) {
    const status = query.status ?? 'active';
    return this.internalReferenceDataService.getByKey(key, status);
  }
}
