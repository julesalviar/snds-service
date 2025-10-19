import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { R2Service } from './r2.service';
import { R2ConfigService } from './r2-config.service';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { AuthController } from 'src/auth/auth.controller';

@Module({
  providers: [R2Service, R2ConfigService],
  exports: [R2Service, R2ConfigService],
})
export class StorageModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(AuthController);
  }
}
