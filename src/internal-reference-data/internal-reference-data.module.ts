import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { InternalReferenceDataController } from './internal-reference-data.controller';
import { InternalReferenceDataService } from './internal-reference-data.service';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';

@Module({
  imports: [],
  providers: [InternalReferenceDataService, ...Object.values(TenantModels)],
  controllers: [InternalReferenceDataController],
  exports: [InternalReferenceDataService, ...Object.values(TenantModels)],
})
export class InternalReferenceDataModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes(InternalReferenceDataController);
  }
}
