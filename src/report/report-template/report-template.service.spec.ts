import { Test, TestingModule } from '@nestjs/testing';
import { ReportTemplateService } from './report-template.service';

describe('ReportTemplateService', () => {
  let service: ReportTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportTemplateService],
    }).compile();

    service = module.get<ReportTemplateService>(ReportTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
