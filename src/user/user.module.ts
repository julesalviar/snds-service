import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { TenantValidationMiddleware } from '../common/middlewares/tenant-validation/tenant-validation.middleware';
import { TenantModels } from '../providers/tenant-models/tenant-models.provider';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { SchoolNeedModule } from 'src/school-need/school-need.module';

@Module({
  imports: [EncryptionModule, SchoolNeedModule],
  providers: [UserService, ...Object.values(TenantModels)],
  controllers: [UsersController],
  exports: [UserService, ...Object.values(TenantModels)],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(UsersController);
  }
}
