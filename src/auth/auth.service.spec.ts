import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service'; // Import UserService
import { createTestingModule, createMockModel } from '../../test/test-utils';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Tenant } from '../tenant/tenant.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let userModel: Model<User>;
  let tenantModel: Model<Tenant>;

  beforeEach(async () => {
    const mockUserModel = createMockModel();
    const mockTenantModel = createMockModel();

    const module: TestingModule = await createTestingModule(AuthService, [
      UserService, // Include UserService
      { provide: PROVIDER.USER_MODEL, useValue: mockUserModel },
      { provide: PROVIDER.TENANT_MODEL, useValue: mockTenantModel }, // Provide mock Tenant model
    ]);

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(PROVIDER.USER_MODEL);
    tenantModel = module.get<Model<Tenant>>(PROVIDER.TENANT_MODEL);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
  });
});
