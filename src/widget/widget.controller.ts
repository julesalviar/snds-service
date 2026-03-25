import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EngagementService } from 'src/engagement/engagement.service';

@UseGuards(JwtAuthGuard)
@Controller('widgets')
export class WidgetController {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly engamentService: EngagementService,
  ) {}

  @Get('health')
  health() {
    return this.widgetService.getHealth();
  }

  @Get('resource-generations')
  resourceGenerations(@Query('schoolYear') schoolYear: string) {
    return this.engamentService.getResourceGenerations(schoolYear);
  }

  @Get('partners')
  partners(@Query('schoolYear') schoolYear: string) {
    return this.engamentService.getPartnerCountsBySector(schoolYear);
  }

  @Get(':widgetType')
  getWidget(@Param('widgetType') widgetType: string) {
    return this.widgetService.getPlaceholder(widgetType);
  }
}
