import { Test, TestingModule } from '@nestjs/testing';
import { ReportTemplateController } from './report-template.controller';

describe('ReportTemplateController', () => {
  let controller: ReportTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportTemplateController],
    }).compile();

    controller = module.get<ReportTemplateController>(ReportTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
