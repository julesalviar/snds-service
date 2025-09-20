import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { StakeholderEngageService } from './stakeholder-engage.service';
@Module({
  imports: [],
  providers: [StakeholderEngageService, ...Object.values(TenantModels)],
  exports: [StakeholderEngageService, ...Object.values(TenantModels)],
})
export class StakeholderEngageModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware);
  }
}
