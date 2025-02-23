import { Connection } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantConnectionProvider } from './tenant-connection';
import { PROVIDER } from 'src/common/constants/providers';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';

describe('TenantConnectionProvider', () => {
  let provider: Connection;

  // Mock Connection
  const mockConnection = {
    useDb: jest.fn().mockReturnValue({}),
  } as Partial<Connection>;

  // Mock Request with tenantCode
  const mockRequest = {
    tenantCode: 'testTenant',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantConnectionProvider,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    provider = module.get<Connection>(PROVIDER.TENANT_CONNECTION);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should call useDb with the correct database name', async () => {
    expect(mockConnection.useDb).toHaveBeenCalledWith('snds_testTenant');
  });
});
