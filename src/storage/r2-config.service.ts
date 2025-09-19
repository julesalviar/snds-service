import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export interface R2Config {
  s3Client: S3Client;
  bucketName: string;
  publicBaseUrl: string;
}

@Injectable()
export class R2ConfigService {
  private readonly logger = new Logger(R2ConfigService.name);
  private readonly config: R2Config;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configService.get<string>('R2_BUCKET');
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');

    if (!endpoint) {
      throw new Error('R2_ENDPOINT environment variable is required');
    }
    if (!accessKeyId) {
      throw new Error('R2_ACCESS_KEY_ID environment variable is required');
    }
    if (!secretAccessKey) {
      throw new Error('R2_SECRET_ACCESS_KEY environment variable is required');
    }
    if (!bucketName) {
      throw new Error('R2_BUCKET environment variable is required');
    }
    if (!publicBaseUrl) {
      throw new Error('R2_PUBLIC_BASE_URL environment variable is required');
    }

    this.logger.log('Initializing R2 configuration', {
      endpoint,
      bucket: bucketName,
      publicBaseUrl,
    });

    const s3Client = new S3Client({
      endpoint,
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.config = {
      s3Client,
      bucketName,
      publicBaseUrl,
    };
  }

  getConfig(): R2Config {
    return this.config;
  }

  getS3Client(): S3Client {
    return this.config.s3Client;
  }

  getBucketName(): string {
    return this.config.bucketName;
  }

  getPublicBaseUrl(): string {
    return this.config.publicBaseUrl;
  }
}
