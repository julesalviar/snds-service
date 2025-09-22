import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { SchoolNeedController } from './school-need.controller';
import { SchoolNeedService } from './school-need.service';
@Module({
  imports: [],
  providers: [SchoolNeedService, ...Object.values(TenantModels)],
  controllers: [SchoolNeedController],
  exports: [SchoolNeedService, ...Object.values(TenantModels)],
})
export class SchoolNeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(SchoolNeedController);
  }
}
