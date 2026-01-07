import { Test, TestingModule } from '@nestjs/testing';
import { ReportQueryController } from './report-query.controller';

describe('ReportQueryController', () => {
  let controller: ReportQueryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportQueryController],
    }).compile();

    controller = module.get<ReportQueryController>(ReportQueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
