import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PpaPlanService } from './ppa-plan.service';
import { PpaPlanController } from './ppa-plan.controller';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { OfficeModule } from 'src/office/office.module';
import { InternalReferenceDataModule } from 'src/internal-reference-data/internal-reference-data.module';
import { FundSourceRefDataValidationPipe } from './fund-source-ref-data.validation.pipe';

@Module({
  imports: [OfficeModule, InternalReferenceDataModule],
  controllers: [PpaPlanController],
  providers: [
    PpaPlanService,
    FundSourceRefDataValidationPipe,
    ...Object.values(TenantModels),
  ],
  exports: [PpaPlanService],
})
export class PpaPlanModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantValidationMiddleware).forRoutes(PpaPlanController);
  }
}
