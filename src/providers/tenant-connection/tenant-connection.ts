import { InternalServerErrorException } from '@nestjs/common';
import { PROVIDER } from 'src/common/constants/providers';
import { Connection } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';

export const TenantConnectionProvider = {
  provide: PROVIDER.TENANT_CONNECTION,
  useFactory: async (request, connection: Connection) => {
    if (!request.tenantCode) {
      throw new InternalServerErrorException();
    }
    return connection.useDb(`snds_${request.tenantCode}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
