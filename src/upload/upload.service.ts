import * as crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ImageService } from 'src/image/image.service';
import { R2ConfigService } from 'src/storage/r2-config.service';
import { R2Service } from 'src/storage/r2.service';

export interface ProcessedUploadResult {
  id: string;
  category: string;
  originalKey: string;
  thumbnailKey: string;
  originalUrl: string;
  thumbnailUrl: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
    private readonly r2ConfigService: R2ConfigService,
    private readonly r2Service: R2Service,
  ) {
    const config = this.r2ConfigService.getConfig();
    this.s3Client = config.s3Client;
    this.bucketName = config.bucketName;
    this.publicBaseUrl = config.publicBaseUrl;
  }

  async uploadImage(file: Express.Multer.File, category: string) {
    return await this.imageService.processAndUploadImage(file, category);
  }

  async uploadDocument(file: Express.Multer.File, category: string) {
    try {
      const ext = this.getFileExtension(file.originalname, file.mimetype);
      const dateBucket = this.getDateBucket();
      const shortUuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

      this.logger.log('Processing document', {
        fileName: file.originalname,
        category,
        size: file.size,
        mimetype: file.mimetype,
      });

      // Document upload uses disk storage (file.path); no buffer in memory
      if (!file.path) {
        throw new Error(
          'File path is missing (document upload expects disk storage)',
        );
      }

      const documentKey = `${category}/${dateBucket}/${shortUuid}.${ext}`;

      this.logger.log('Uploading document from disk', { key: documentKey });
      const documentUrl = await this.r2Service.uploadFileFromPath(
        file.path,
        documentKey,
        file.mimetype,
      );

      this.logger.log('Document upload completed', {
        documentUrl,
      });

      return {
        id: `${shortUuid}`,
        originalUrl: documentUrl,
      };
    } catch (error) {
      this.logger.error('Document upload failed', error.stack);
      throw error;
    }
  }

  private getFileExtension(filename: string, mimetype: string): string {
    // Try to get extension from filename first
    const filenameExt = filename.split('.').pop()?.toLowerCase();

    // Map mimetypes to extensions
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/rtf': 'rtf',
      'text/plain': 'txt',
      'application/vnd.oasis.opendocument.text': 'odt',
    };

    if (mimeToExt[mimetype]) {
      return mimeToExt[mimetype];
    }

    // Fallback to the filename extension or default to 'bin'
    return filenameExt || 'bin';
  }

  private getDateBucket(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
}
