import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { UserModule } from 'src/user/user.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { QueueModule } from 'src/queue/queue.module';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';

@Module({
  imports: [UserModule, EncryptionModule, QueueModule],
  controllers: [MailController],
  providers: [MailService, ...Object.values(TenantModels)],
  exports: [MailService],
})
export class MailModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes(MailController);
  }
}
