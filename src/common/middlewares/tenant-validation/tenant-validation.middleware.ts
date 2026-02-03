import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TenantService } from 'src/tenant/tenant.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantValidationMiddleware.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly cls: ClsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const isUploadRequest = req.url.startsWith('/upload');
      const logData: any = {
        url: req.url,
        method: req.method,
        headers: req.headers,
      };

      if (!isUploadRequest) {
        logData.body = req.body;
      }

      this.logger.debug('Tenant validation middleware called', logData);

      // Skip tenant validation for truly public routes that don't need database access
      // This should be removed once we have a decorator for public routes that skips tenant validation
      const isPublicRoute =
        req.url.startsWith('/status') ||
        req.url.startsWith('/health') ||
        req.url.startsWith('/docs');

      if (isPublicRoute) {
        this.logger.debug('Skipping tenant validation for public route', {
          url: req.url,
        });
        return next();
      }

      const tenantHeader = req.headers['tenant'];

      if (!tenantHeader) {
        this.logger.warn('Tenant header is missing');
        throw new UnauthorizedException('Tenant header is missing');
      }

      const tenantCode = tenantHeader.toString();
      this.logger.log('Looking up tenant', { tenantCode });

      const tenant = await this.tenantService.getTenantById(tenantCode);
      if (!tenant) {
        this.logger.warn('Tenant not found', { tenantCode });
        throw new UnauthorizedException('Tenant not found');
      }

      this.logger.log('Tenant found', { tenantCode, tenantId: tenant._id });
      req['tenantId'] = tenant._id;
      req['tenantCode'] = tenant.tenantCode;

      this.cls.set('tenantId', tenant._id);
      this.cls.set('tenantCode', tenant.tenantCode);

      next();
    } catch (error) {
      this.logger.error('Tenant validation failed', error.stack);
      throw error;
    }
  }
}
