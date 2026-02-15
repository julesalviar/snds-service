import { Test, TestingModule } from '@nestjs/testing';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';

describe('OfficeController', () => {
  let controller: OfficeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficeController],
      providers: [
        {
          provide: OfficeService,
          useValue: {
            create: jest.fn(),
            deleteOffice: jest.fn(),
            updateOffice: jest.fn(),
            getAll: jest.fn(),
            getOfficeById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OfficeController>(OfficeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
