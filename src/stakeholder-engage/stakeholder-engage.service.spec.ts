import { Test, TestingModule } from '@nestjs/testing';
import { StakeholderEngageService } from './stakeholder-engage.service';

describe('StakeholderEngageService', () => {
  let service: StakeholderEngageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StakeholderEngageService],
    }).compile();

    service = module.get<StakeholderEngageService>(StakeholderEngageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
