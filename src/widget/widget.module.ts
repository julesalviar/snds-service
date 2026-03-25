import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { TenantValidationMiddleware } from 'src/common/middlewares/tenant-validation/tenant-validation.middleware';
import { EngagementModule } from 'src/engagement/engagement.module';

@Module({
  imports: [EngagementModule],
  controllers: [WidgetController],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantValidationMiddleware).forRoutes(WidgetController);
  }
}
