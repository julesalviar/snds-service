import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { UserModule } from 'src/user/user.module';
import { ReferenceDataModule } from 'src/reference-data/reference-data.module';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { SchoolNeedController } from './school-need.controller';
import { SchoolNeedService } from './school-need.service';
@Module({
  imports: [UserModule, ReferenceDataModule],
  providers: [SchoolNeedService, BasicAuthGuard, ...Object.values(TenantModels)],
  controllers: [SchoolNeedController],
  exports: [SchoolNeedService, ...Object.values(TenantModels)],
})
export class SchoolNeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(SchoolNeedController);
  }
}
