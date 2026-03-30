import * as crypto from 'node:crypto';
import sharp from 'sharp';
import { Injectable, Logger } from '@nestjs/common';
import { R2Service } from 'src/storage/r2.service';

// Reduce Sharp's memory footprint: disable cache, limit concurrency
sharp.cache(false);
sharp.concurrency(1);

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly r2Service: R2Service) {}

  /**
   * Process and upload image. Prefers file.path (disk) over file.buffer (memory)
   * to avoid loading large images into RAM. Sharp reads from path when available.
   */
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
        fromDisk: !!file.path,
      });

      // Prefer disk path to avoid loading entire image into memory
      const input = file.path ?? file.buffer;
      if (!input) {
        throw new Error('File path or buffer is required');
      }
      if (typeof input === 'object' && (input as Buffer).length === 0) {
        throw new Error('File buffer is empty');
      }

      this.logger.log('Creating compressed image');
      const sharpOptions = { limitInputPixels: 50_000_000 }; // ~7k×7k max, prevents huge images
      let compressed = await sharp(input as string | Buffer, sharpOptions)
        .resize(1024)
        .jpeg({ quality: 80 })
        .toBuffer();

      this.logger.log('Creating thumbnail');
      let thumbnail = await sharp(input as string | Buffer, sharpOptions)
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
      compressed = null;

      this.logger.log('Uploading thumbnail', { key: thumbnailKey });
      const thumbnailUrl = await this.r2Service.uploadFile(
        thumbnail,
        thumbnailKey,
        file.mimetype,
      );
      thumbnail = null;

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
