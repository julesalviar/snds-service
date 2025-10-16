import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SchoolSummaryController } from './school-summary.controller';
import { SchoolSummaryService } from './school-summary.service';
import { TenantModels } from '../providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from '../common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  controllers: [SchoolSummaryController],
  providers: [SchoolSummaryService, ...Object.values(TenantModels)],
  exports: [SchoolSummaryService, ...Object.values(TenantModels)],
})
export class SchoolSummaryModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes(SchoolSummaryController);
  }
}

