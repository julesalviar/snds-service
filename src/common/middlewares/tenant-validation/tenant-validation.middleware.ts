import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantHeader = req.headers['tenant'];

    if (!tenantHeader) {
      throw new UnauthorizedException('Tenant header is missing');
    }

    const tenantCode = tenantHeader.toString();

    const tenant = await this.tenantService.getTenantById(tenantCode);
    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    req['tenantId'] = tenant._id;
    req['tenantCode'] = tenant.tenantCode;
    next();
  }
}
