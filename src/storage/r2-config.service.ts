import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { ClsService } from 'nestjs-cls';

export interface R2Config {
  s3Client: S3Client;
  bucketName: string;
  publicBaseUrl: string;
}

@Injectable()
export class R2ConfigService {
  private readonly logger = new Logger(R2ConfigService.name);
  private readonly config: R2Config;

  constructor(
    private readonly configService: ConfigService,
    private readonly clsService: ClsService,
  ) {}

  getConfig(): R2Config {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const r2Bucket = this.configService.get<string>('R2_BUCKET');
    const tenantCode = this.clsService.get('tenantCode');
    const bucketName = this.resolveBucketName(r2Bucket, tenantCode);
    const publicBaseUrl = this.resolvePublicBaseUrl(tenantCode);

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

    const s3Client = new S3Client({
      endpoint,
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return {
      s3Client,
      bucketName,
      publicBaseUrl,
    };
  }

  getS3Client(): S3Client {
    return this.getConfig().s3Client;
  }

  getBucketName(): string {
    return this.getConfig().bucketName;
  }

  getPublicBaseUrl(): string {
    return this.getConfig().publicBaseUrl;
  }

  private resolveBucketName(
    base?: string,
    tenant?: string,
  ): string | undefined {
    if (!base) {
      return undefined;
    }

    if (tenant) {
      return `${base}-${tenant}`;
    }

    return base;
  }

  private resolvePublicBaseUrl(tenant?: string): string {
    const baseDomain = this.configService.get<string>('R2_PUBLIC_BASE_DOMAIN'); // e.g. example.com
    const subdomain = tenant ? `media-${tenant}` : 'media';
    return `https://${subdomain}.${baseDomain}`;
  }
}
