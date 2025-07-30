import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { TenantValidationMiddleware } from '../common/middlewares/tenant-validation/tenant-validation.middleware';
import { TenantModels } from '../providers/tenant-models/tenant-models.provider';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
    imports: [EncryptionModule],
    providers: [SchoolService, ...Object.values(TenantModels)],
    controllers: [SchoolController],
    exports: [SchoolService, ...Object.values(TenantModels)],
})
export class SchoolModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(TenantValidationMiddleware).forRoutes(SchoolController);
    }
}