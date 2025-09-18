import { Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { R2ConfigService } from './r2-config.service';

@Module({
  providers: [R2Service, R2ConfigService],
  exports: [R2Service, R2ConfigService],
})
export class StorageModule {}
