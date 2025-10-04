import { Test, TestingModule } from '@nestjs/testing';
import { ShsImmersionController } from './shs-immersion.controller';

describe('ShsImmersionController', () => {
  let controller: ShsImmersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShsImmersionController],
    }).compile();

    controller = module.get<ShsImmersionController>(ShsImmersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
