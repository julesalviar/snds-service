import { Connection } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantConnectionProvider } from './tenant-connection';
import { PROVIDER } from 'src/common/constants/providers';
import { REQUEST } from '@nestjs/core';
import { TenantConnectionResolverService } from './tenant-connection-resolver.service';

describe('TenantConnectionProvider', () => {
  let provider: Connection;
  const mockTenantConnection = {};

  const mockResolver = {
    getConnectionForTenant: jest.fn().mockReturnValue(mockTenantConnection),
  };

  const mockRequest = {
    tenantCode: 'testTenant',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockResolver.getConnectionForTenant.mockReturnValue(mockTenantConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantConnectionProvider,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        {
          provide: TenantConnectionResolverService,
          useValue: mockResolver,
        },
      ],
    }).compile();

    provider = module.get<Connection>(PROVIDER.TENANT_CONNECTION);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should call getConnectionForTenant with the correct tenant code', () => {
    expect(mockResolver.getConnectionForTenant).toHaveBeenCalledWith('testTenant');
  });
});
