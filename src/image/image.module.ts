import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
