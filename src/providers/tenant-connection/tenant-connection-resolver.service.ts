import { Inject, Injectable } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Resolves tenant database connection by tenant code.
 * Used when tenant context is known (e.g. from SQS message) but REQUEST is not available.
 */
@Injectable()
export class TenantConnectionResolverService {
  constructor(
    @Inject(getConnectionToken())
    private readonly connection: Connection,
  ) {}

  getConnectionForTenant(tenantCode: string): Connection {
    return this.connection.useDb(`snds_${tenantCode}`);
  }
}
