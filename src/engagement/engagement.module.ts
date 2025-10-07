import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { Engagement, EngagementSchema } from './engagement.schema';
import { PROVIDER } from 'src/common/constants/providers';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [EngagementController],
  providers: [EngagementService, ...Object.values(TenantModels)],
  exports: [EngagementService, ...Object.values(TenantModels)],
})
export class EngagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(EngagementController);
  }
}
