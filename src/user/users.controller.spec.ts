import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './user.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let userService: Partial<UserService>;

  beforeEach(async () => {
    userService = {
      getUsers: jest.fn().mockResolvedValue([]),
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

  it('should return an empty array when no users exist', async () => {
    expect(await usersController.getUsers()).toEqual([]);
  });
});
