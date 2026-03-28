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

  getResourceGenerationsBySector(schoolYear: string) {
    return this.engagementService.getResourceGenerationsBySector(schoolYear);
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
