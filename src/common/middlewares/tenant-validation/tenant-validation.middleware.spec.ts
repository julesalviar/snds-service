import { TenantValidationMiddleware } from './tenant-validation.middleware';
import { TenantService } from 'src/tenant/tenant.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantDocument } from 'src/tenant/tenantSchema';

describe('TenantValidationMiddleware', () => {
  let middleware: TenantValidationMiddleware;
  let tenantService: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantValidationMiddleware,
        {
          provide: TenantService,
          useValue: {
            getTenantById: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<TenantValidationMiddleware>(
      TenantValidationMiddleware,
    );
    tenantService = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw UnauthorizedException if tenant header is missing', async () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if tenant is not found', async () => {
    const req: any = { headers: { tenant: 'invalidTenant' } };
    const res: any = {};
    const next = jest.fn();
    jest.spyOn(tenantService, 'getTenantById').mockResolvedValue(null);

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set tenantId and tenantCode and call next() when valid', async () => {
    const req: any = { headers: { tenant: 'validTenant' } };
    const res: any = {};
    const next = jest.fn();

    const mockTenant: Partial<TenantDocument> = {
      _id: new Types.ObjectId(),
      tenantCode: 'validTenant',
    };

    jest
      .spyOn(tenantService, 'getTenantById')
      .mockResolvedValue(mockTenant as TenantDocument);

    await middleware.use(req, res, next);

    expect(req.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(req.tenantCode).toBe('validTenant');
    expect(next).toHaveBeenCalled();
  });
});
