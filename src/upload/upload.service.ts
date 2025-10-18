import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ImageService } from 'src/image/image.service';
import { R2ConfigService } from 'src/storage/r2-config.service';

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
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
    private readonly r2ConfigService: R2ConfigService,
  ) {
    const config = this.r2ConfigService.getConfig();
    this.s3Client = config.s3Client;
    this.bucketName = config.bucketName;
    this.publicBaseUrl = config.publicBaseUrl;
  }

  async uploadImage(file: Express.Multer.File, category: string) {
    return await this.imageService.processAndUploadImage(file, category);
  }
}
