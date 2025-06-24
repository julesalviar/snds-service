import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CounterModule } from 'src/common/counter/counter.module';
import { TenantValidationMiddleware } from '../common/middlewares/tenant-validation/tenant-validation.middleware';
import { TenantModels } from '../providers/tenant-models/tenant-models.provider';
import { AipController } from './aip.controller';
import { AipService } from './aip.service';

@Module({
  imports: [CounterModule],
  providers: [AipService, ...Object.values(TenantModels)],
  controllers: [AipController],
  exports: [AipService, ...Object.values(TenantModels)],
})
export class AiplModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(AipController);
  }
}
