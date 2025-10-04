import { Test, TestingModule } from '@nestjs/testing';
import { ShsImmersionService } from './shs-immersion.service';

describe('ShsImmersionService', () => {
  let service: ShsImmersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShsImmersionService],
    }).compile();

    service = module.get<ShsImmersionService>(ShsImmersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
