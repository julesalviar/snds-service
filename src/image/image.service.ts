import * as crypto from 'node:crypto';
import sharp from 'sharp';
import { Injectable, Logger } from '@nestjs/common';
import { R2Service } from 'src/storage/r2.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly r2Service: R2Service) {}

  async processAndUploadImage(file: Express.Multer.File, category: string) {
    try {
      const ext = file.mimetype.split('/')[1];
      const dateBucket = this.getDateBucket();
      const shortUuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

      this.logger.log('Processing image', {
        fileName: file.originalname,
        category,
        size: file.size,
        mimetype: file.mimetype,
      });

      if (!file.buffer || file.buffer.length === 0) {
        throw new Error('File buffer is empty');
      }

      this.logger.log('Creating compressed image');
      const compressed = await sharp(file.buffer)
        .resize(1024)
        .jpeg({ quality: 80 })
        .toBuffer();

      this.logger.log('Creating thumbnail');
      const thumbnail = await sharp(file.buffer)
        .resize(300)
        .jpeg({ quality: 60 })
        .toBuffer();

      const originalKey = `${category}/${dateBucket}/${shortUuid}.${ext}`;
      const thumbnailKey = `${category}/${dateBucket}/${shortUuid}-thumb.${ext}`;

      this.logger.log('Uploading original image', { key: originalKey });
      const originalUrl = await this.r2Service.uploadFile(
        compressed,
        originalKey,
        file.mimetype,
      );

      this.logger.log('Uploading thumbnail', { key: thumbnailKey });
      const thumbnailUrl = await this.r2Service.uploadFile(
        thumbnail,
        thumbnailKey,
        file.mimetype,
      );

      this.logger.log('Image processing completed', {
        originalUrl,
        thumbnailUrl,
      });
      return { id: `${shortUuid}`, originalUrl, thumbnailUrl };
    } catch (error) {
      this.logger.error('Image processing failed', error.stack);
      throw error;
    }
  }

  getDateBucket(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
}
