import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  imports: [],
  providers: [OfficeService, ...Object.values(TenantModels)],
  controllers: [OfficeController],
  exports: [OfficeService, ...Object.values(TenantModels)],
})
export class OfficeModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(OfficeController);
  }
}
