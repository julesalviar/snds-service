import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PpaPlanService } from './ppa-plan.service';
import { PpaPlanController } from './ppa-plan.controller';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  controllers: [PpaPlanController],
  providers: [PpaPlanService, ...Object.values(TenantModels)],
  exports: [PpaPlanService],
})
export class PpaPlanModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantValidationMiddleware).forRoutes(PpaPlanController);
  }
}
