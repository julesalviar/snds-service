import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserInviteController } from './user-invite.controller';
import { UserInviteService } from './user-invite.service';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';

@Module({
  controllers: [UserInviteController],
  providers: [
    UserInviteService,
    TenantModels.userInviteModel,
    TenantModels.registrationTokenModel,
  ],
  exports: [UserInviteService],
})
export class UserInviteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes(UserInviteController);
  }
}
