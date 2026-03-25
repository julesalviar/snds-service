import { Injectable } from '@nestjs/common';
import { EngagementService } from 'src/engagement/engagement.service';

@Injectable()
export class WidgetService {
  constructor(private readonly engagementService: EngagementService) {}

  getHealth() {
    return {
      success: true,
      data: { status: 'ok', scope: 'widgets' },
      meta: { timestamp: new Date() },
    };
  }

  getResourceGenerationsPlaceholder() {
    return {
      success: true,
      data: {
        message: 'Resource generations widget placeholder',
      },
      meta: { timestamp: new Date() },
    };
  }

  getPlaceholder(widgetType: string) {
    return {
      success: true,
      data: {
        message: 'Widget endpoint placeholder',
        widgetType,
      },
      meta: { timestamp: new Date() },
    };
  }

  getPartnersBySector(schoolYear: string) {
    return this.engagementService.getPartnerCountsBySector(schoolYear);
  }
}
