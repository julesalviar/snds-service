import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ImageModule } from 'src/image/image.module';
import { StorageModule } from 'src/storage/storage.module';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';

@Module({
  imports: [ImageModule, StorageModule],
  providers: [UploadService, TenantModels.imageUploadModel],
  controllers: [UploadController],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantValidationMiddleware).forRoutes(UploadController);
  }
}
