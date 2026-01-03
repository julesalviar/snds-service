import { Controller, Get, Query, Param } from '@nestjs/common';
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

  @Get(':key')
  async getReferenceDataByKey(
    @Param('key') key: string,
    @Query() query: StatusQueryDto,
  ) {
    const status = query.status ?? 'active';
    return this.referenceDataService.getByKey(key, status);
  }
}
