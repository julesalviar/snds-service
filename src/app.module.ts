import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { mongooseModuleAsyncOptions } from './config/mongo.config';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EncryptionModule } from './encryption/encryption.module';
import { AipModule } from './aip/aip.module';
import { CounterModule } from './common/counter/counter.module';
import { SchoolNeedModule } from 'src/school-need/school-need.module';
import { ReferenceDataModule } from 'src/reference-data/reference-data.module';
import { SchoolModule } from './schools/school.module';
import { UploadModule } from './upload/upload.module';
import { ImageModule } from './image/image.module';
import { StorageModule } from './storage/storage.module';
import { StakeholderEngageModule } from './stakeholder-engage/stakeholder-engage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
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
    UploadModule,
    ImageModule,
    StorageModule,
    StakeholderEngageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
