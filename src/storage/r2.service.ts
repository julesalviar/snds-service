import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { R2ConfigService } from './r2-config.service';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly r2ConfigService: R2ConfigService) {
    const config = this.r2ConfigService.getConfig();
    this.s3Client = config.s3Client;
    this.bucketName = config.bucketName;
    this.publicBaseUrl = config.publicBaseUrl;
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<string> {
    try {
      this.logger.log('Uploading file to R2', {
        key,
        size: buffer.length,
        mimeType,
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      const url = `${this.publicBaseUrl}/${key}`;
      this.logger.log('File uploaded successfully', { key, url });

      return url;
    } catch (error) {
      this.logger.error('Failed to upload file to R2', {
        key,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  extractKeyFromUrl(url: string): string {
    return url.replace(`${this.publicBaseUrl}/`, '');
  }
}
