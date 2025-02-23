import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDER } from 'src/common/constants/providers';

/**
 * Creates a testing module for a given service and its dependencies.
 * @param service The service to be tested.
 * @param dependencies Any additional providers required for the test.
 * @returns A TestingModule instance.
 */
export async function createTestingModule<T>(
  service: new (...args: any[]) => T,
  dependencies: any[] = [],
): Promise<TestingModule> {
  return await Test.createTestingModule({
    providers: [service, ...dependencies],
  }).compile();
}

/**
 * Creates mock models for Mongoose-based repositories.
 * @returns Mock implementations of Mongoose model methods.
 */
export function createMockModel() {
  return {
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    findOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    create: jest.fn().mockResolvedValue({}),
    updateOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    deleteOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
  };
}

/**
 * Creates a mock tenant connection with model overrides.
 * @param userModel The mocked user model.
 * @param tenantModel The mocked tenant model.
 * @returns A mock tenant connection object.
 */
export function createMockTenantConnection(userModel: any, tenantModel: any) {
  return {
    model: jest.fn().mockImplementation((name) => {
      if (name === PROVIDER.USER_MODEL) return userModel;
      if (name === PROVIDER.TENANT_MODEL) return tenantModel;
    }),
  };
}
