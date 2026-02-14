import { Test, TestingModule } from '@nestjs/testing';
import { PpaPlanController } from './ppa-plan.controller';

describe('PpaPlanController', () => {
  let controller: PpaPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PpaPlanController],
    }).compile();

    controller = module.get<PpaPlanController>(PpaPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
