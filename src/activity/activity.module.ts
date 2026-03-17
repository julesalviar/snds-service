import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  imports: [],
  providers: [ActivityService, ...Object.values(TenantModels)],
  controllers: [ActivityController],
  exports: [ActivityService, ...Object.values(TenantModels)],
})
export class ActivityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantValidationMiddleware).forRoutes(ActivityController);
  }
}
