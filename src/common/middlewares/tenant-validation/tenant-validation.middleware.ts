import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantValidationMiddleware.name);

  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug('Tenant validation middleware called', {
        url: req.url,
        method: req.method,
        headers: req.headers,
      });

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
      next();
    } catch (error) {
      this.logger.error('Tenant validation failed', error.stack);
      throw error;
    }
  }
}
