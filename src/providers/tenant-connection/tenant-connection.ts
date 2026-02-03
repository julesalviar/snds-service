import { InternalServerErrorException } from '@nestjs/common';
import { PROVIDER } from 'src/common/constants/providers';
import { REQUEST } from '@nestjs/core';
import { TenantConnectionResolverService } from './tenant-connection-resolver.service';

export const TenantConnectionProvider = {
  provide: PROVIDER.TENANT_CONNECTION,
  useFactory: (
    request: { tenantCode?: string },
    resolver: TenantConnectionResolverService,
  ) => {
    if (!request.tenantCode) {
      throw new InternalServerErrorException(
        'Tenant code is required. Please ensure TenantValidationMiddleware is applied and tenant header is provided.',
      );
    }
    return resolver.getConnectionForTenant(request.tenantCode);
  },
  inject: [REQUEST, TenantConnectionResolverService],
};
