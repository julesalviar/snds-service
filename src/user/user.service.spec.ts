import { TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Tenant } from 'src/tenant/tenantSchema';
import { PROVIDER } from 'src/common/constants/providers';
import {
  createTestingModule,
  createMockModel,
  createMockTenantConnection,
} from '../../test/test-utils';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<User>;
  let tenantModel: Model<Tenant>;

  beforeEach(async () => {
    const mockUserModel = createMockModel();
    const mockTenantModel = createMockModel();
    const mockTenantConnection = createMockTenantConnection(
      mockUserModel,
      mockTenantModel,
    );

    const module: TestingModule = await createTestingModule(UserService, [
      { provide: PROVIDER.TENANT_CONNECTION, useValue: mockTenantConnection },
      {
        provide: PROVIDER.USER_MODEL,
        useFactory: () => mockUserModel,
        inject: [PROVIDER.TENANT_CONNECTION],
      },
      {
        provide: PROVIDER.TENANT_MODEL,
        useFactory: () => mockTenantModel,
        inject: [PROVIDER.TENANT_CONNECTION],
      },
    ]);

    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(PROVIDER.USER_MODEL);
    tenantModel = module.get<Model<Tenant>>(PROVIDER.TENANT_MODEL);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should call find method on user model', async () => {
    await userService.getUsers();
    expect(userModel.find).toHaveBeenCalled();
  });
});
