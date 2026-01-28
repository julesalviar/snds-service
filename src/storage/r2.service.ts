import * as fs from 'node:fs';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { R2ConfigService } from './r2-config.service';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);

  constructor(private readonly r2ConfigService: R2ConfigService) {}

  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<string> {
    const config = this.r2ConfigService.getConfig();
    const s3Client = config.s3Client;
    const bucketName = config.bucketName;
    const publicBaseUrl = config.publicBaseUrl;

    try {
      this.logger.log('Uploading file to R2', {
        key,
        size: buffer.length,
        mimeType,
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const url = `${publicBaseUrl}/${key}`;
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

  /** Upload from a file path (streaming) to avoid loading large files into RAM. */
  async uploadFileFromPath(
    filePath: string,
    key: string,
    mimeType: string,
  ): Promise<string> {
    const config = this.r2ConfigService.getConfig();
    const s3Client = config.s3Client;
    const bucketName = config.bucketName;
    const publicBaseUrl = config.publicBaseUrl;

    try {
      const stat = await fs.promises.stat(filePath);
      this.logger.log('Uploading file to R2 from path', {
        key,
        size: stat.size,
        mimeType,
      });

      const stream = fs.createReadStream(filePath);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: stream,
        ContentLength: stat.size,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const url = `${publicBaseUrl}/${key}`;
      this.logger.log('File uploaded successfully', { key, url });

      return url;
    } catch (error) {
      this.logger.error('Failed to upload file to R2 from path', {
        key,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const config = this.r2ConfigService.getConfig();
    const s3Client = config.s3Client;
    const bucketName = config.bucketName;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  extractKeyFromUrl(url: string): string {
    const config = this.r2ConfigService.getConfig();
    const publicBaseUrl = config.publicBaseUrl;
    return url.replace(`${publicBaseUrl}/`, '');
  }
}
