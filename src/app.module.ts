import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ClsModule, ClsMiddleware } from 'nestjs-cls';
import { mongooseModuleAsyncOptions } from './config/mongo.config';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EncryptionModule } from './encryption/encryption.module';
import { AipModule } from './aip/aip.module';
import { CounterModule } from './common/counter/counter.module';
import { SchoolNeedModule } from 'src/school-need/school-need.module';
import { ReferenceDataModule } from 'src/reference-data/reference-data.module';
import { InternalReferenceDataModule } from 'src/internal-reference-data/internal-reference-data.module';
import { SchoolModule } from './schools/school.module';
import { UploadModule } from './upload/upload.module';
import { ImageModule } from './image/image.module';
import { StorageModule } from './storage/storage.module';
import { ClusterModule } from './cluster/cluster.module';
import { ShsImmersionController } from './shs-immersion/shs-immersion.controller';
import { ShsImmersionService } from './shs-immersion/shs-immersion.service';
import { ShsImmersionModule } from './shs-immersion/shs-immersion.module';
import { EngagementModule } from './engagement/engagement.module';
import { MailModule } from './mail/mail.module';
import { UserInviteModule } from './user-invite/user-invite.module';
import { ReportModule } from 'src/report/report.module';
import { PpaPlanModule } from './ppa-plan/ppa-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: false, // Mount it manually in configure() to control order
      },
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    TenantModule,
    UserModule,
    AuthModule,
    EncryptionModule,
    AipModule,
    CounterModule,
    SchoolNeedModule,
    SchoolModule,
    ReferenceDataModule,
    InternalReferenceDataModule,
    UploadModule,
    ImageModule,
    StorageModule,
    ShsImmersionModule,
    ClusterModule,
    EngagementModule,
    MailModule,
    UserInviteModule,
    ReportModule,
    PpaPlanModule,
  ],
  controllers: [AppController, ShsImmersionController],
  providers: [AppService, ShsImmersionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply ClsMiddleware to all routes to ensure CLS context is available
    consumer.apply(ClsMiddleware).forRoutes('*');
  }
}
