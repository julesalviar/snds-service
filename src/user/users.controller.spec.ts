import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './user.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let userService: Partial<UserService>;

  beforeEach(async () => {
    userService = {
      getUsers: jest.fn().mockResolvedValue({
        data: [],
        meta: {
          count: 0,
          totalItems: 0,
          currentPage: 1,
          totalPages: 1,
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('should return paginated result when no users exist', async () => {
    const result = await usersController.getUsers();
    expect(result).toEqual({
      data: [],
      meta: {
        count: 0,
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
      },
    });
  });
});
