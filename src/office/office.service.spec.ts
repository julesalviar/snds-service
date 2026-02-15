import { Test, TestingModule } from '@nestjs/testing';
import { OfficeService } from './office.service';
import { PROVIDER } from '../common/constants/providers';
import { getModelToken } from '@nestjs/mongoose';

describe('OfficeService', () => {
  let service: OfficeService;

  const mockOfficeModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    countDocuments: jest.fn(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeService,
        {
          provide: PROVIDER.OFFICE_MODEL,
          useValue: mockOfficeModel,
        },
      ],
    }).compile();

    service = module.get<OfficeService>(OfficeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
