import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { SchoolNeedController } from 'src/school-need/school-need.controller';
import { UserModule } from 'src/user/user.module';
import { ReportService } from 'src/report/report.service';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { ReportController } from './report.controller';
import { EngagementModule } from 'src/engagement/engagement.module';

@Module({
  imports: [UserModule, EngagementModule],
  controllers: [ReportController],
  providers: [ReportService, ...Object.values(TenantModels)],
  exports: [ReportService, ...Object.values(TenantModels)],
})
export class ReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantValidationMiddleware).forRoutes(SchoolNeedController);
  }
}
