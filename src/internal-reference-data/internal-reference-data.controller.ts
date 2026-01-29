import { Controller, Get, Put, Query, Param, Body } from '@nestjs/common';
import { InternalReferenceDataService } from 'src/internal-reference-data/internal-reference-data.service';
import { InternalReferenceDataByKeyQueryDto } from 'src/internal-reference-data/internal-reference-data-by-key-query.dto';
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
    @Query() query: InternalReferenceDataByKeyQueryDto,
  ) {
    const status = query.status ?? 'active';
    return this.internalReferenceDataService.getByKey(key, status, query.sort);
  }

  @Put(':key')
  async updateInternalReferenceDataByKey(
    @Param('key') key: string,
    @Body() value: any,
  ) {
    return this.internalReferenceDataService.updateByKey(key, value);
  }
}
