import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { UserModule } from 'src/user/user.module';
import { ReportService } from 'src/report/report.service';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { ReportController } from './report.controller';
import { EngagementModule } from 'src/engagement/engagement.module';
import { ReportTemplateService } from './report-template/report-template.service';
import { ReportTemplateController } from './report-template/report-template.controller';
import { ReportQueryService } from './report-query/report-query.service';
import { ReportQueryController } from './report-query/report-query.controller';

@Module({
  imports: [UserModule, EngagementModule],
  controllers: [
    ReportController,
    ReportTemplateController,
    ReportQueryController,
  ],
  providers: [
    ReportService,
    ...Object.values(TenantModels),
    ReportTemplateService,
    ReportQueryService,
  ],
  exports: [ReportService, ...Object.values(TenantModels)],
})
export class ReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes(
        ReportController,
        ReportTemplateController,
        ReportQueryController,
      );
  }
}
