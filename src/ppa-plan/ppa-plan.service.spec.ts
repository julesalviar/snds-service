import { Test, TestingModule } from '@nestjs/testing';
import { PpaPlanService } from './ppa-plan.service';

describe('PpaPlanService', () => {
  let service: PpaPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PpaPlanService],
    }).compile();

    service = module.get<PpaPlanService>(PpaPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
