import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantModels } from 'src/providers/tenant-models/tenant-models.provider';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { ShsImmersionController } from './shs-immersion.controller';
import { ShsImmersionService } from './shs-immersion.service';
@Module({
    imports: [],
    providers: [ShsImmersionService, ...Object.values(TenantModels)],
    controllers: [ShsImmersionController],
    exports: [ShsImmersionService, ...Object.values(TenantModels)],
})
export class ShsImmersionModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(TenantValidationMiddleware).forRoutes(ShsImmersionController);
    }
}
