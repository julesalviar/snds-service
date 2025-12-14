import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { UserModule } from 'src/user/user.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  imports: [UserModule, EncryptionModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(MailController);
  }
}
