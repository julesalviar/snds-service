import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { ClusterController } from './cluster.controller';
import { ClusterService } from './cluster.service';
import { CounterModule } from 'src/common/counter/counter.module';

@Module({
  imports: [CounterModule],
  providers: [ClusterService, ...Object.values(TenantModels)],
  controllers: [ClusterController],
  exports: [ClusterService, ...Object.values(TenantModels)],
})
export class ClusterModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(ClusterController);
  }
}
