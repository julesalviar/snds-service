import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Tenant, TenantDocument } from './tenantSchema';
import { NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let tenantService: TenantService;
  let tenantModel: Model<TenantDocument>;

  const mockTenantModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
    create: jest.fn().mockImplementation((tenantData) => ({
      ...tenantData,
      save: jest.fn().mockResolvedValue(tenantData),
    })),
    save: jest.fn(),
  };

  const mockConnection = {
    // Add a mock for the Connection object
    readyState: 1, // Simulating an open connection
    close: jest.fn(),
  } as Partial<Connection>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getModelToken(Tenant.name),
          useValue: mockTenantModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    tenantService = module.get<TenantService>(TenantService);
    tenantModel = module.get<Model<TenantDocument>>(getModelToken(Tenant.name));
  });

  it('should be defined', () => {
    expect(tenantService).toBeDefined();
  });

  it('should call findAll and return an empty array', async () => {
    const tenants = await tenantService.findAll();
    expect(tenantModel.find).toHaveBeenCalled();
    expect(tenants).toEqual([]);
  });

  it('should throw NotFoundException when getTenantById is called with a non-existent ID', async () => {
    await expect(tenantService.getTenantById('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create a new tenant', async () => {
    const tenantData = { tenantCode: 'ABC123', name: 'Test Tenant' };
    const result = await tenantService.createTenant(tenantData);
    expect(result).toEqual(expect.objectContaining(tenantData));
    expect(mockTenantModel.create).toHaveBeenCalledWith(tenantData);
  });
});
