import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { COUNTER } from 'src/common/constants/counters';
import { CounterService } from 'src/common/counter/counter.services';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ImmersionInfoDto, ImmersionVenueDto } from './shs-immersion.dto';
import { ImmersionInfo } from './shs-immersion-info.schema';
import { School } from 'src/schools/school.schema';

@Injectable()
export class ShsImmersionService {
  private readonly logger = new Logger(ShsImmersionService.name);

  constructor(
    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,

    @Inject(PROVIDER.IMMERSION_INFO_MODEL)
    private readonly immersionInfoModel: Model<ImmersionInfo>,
    private readonly counterService: CounterService,
  ) {}

  async createShsImmersionInfo(immersionDto: ImmersionInfoDto): Promise<any> {
    try {
      const schoolId = immersionDto.schoolId;
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new BadRequestException(`Invalid School Id: ${schoolId}`);
      }
      const school = await this.schoolModel
        .findById(schoolId)
        .select('schoolName');
      if (!school) {
        throw new BadRequestException(`School with Id: ${schoolId} not found`);
      }

      this.logger.log(
        'Creating new Immersion information with the following data:',
        immersionDto,
      );

      const code = await this.counterService.getNextSequenceValue(
        COUNTER.SHS_IMMERSION_CODE,
      );

      const createdImmersionInfo = new this.immersionInfoModel({
        ...immersionDto,
        immersionCode: code,
      });

      const savedImmersionInfo = await createdImmersionInfo.save();
      this.logger.log(
        `Immersion Info created successfully with ID: ${savedImmersionInfo._id.toString()}`,
      );
      return savedImmersionInfo;
    } catch (error) {
      this.logger.error('Error creating Immersion Info', error.stack);
      throw error;
    }
  }

  async getAll(schoolId?: string, page = 1, limit = 10) {
    try {
      this.logger.log(`Attempting to retrieve all Immersion info`);
      const skip = (page - 1) * limit;
      const queryFilter: any = {};
      if (schoolId) queryFilter.schoolId = schoolId;

      const [immersions, total] = await Promise.all([
        this.immersionInfoModel
          .find(queryFilter)
          .populate({
            path: 'schoolId',
            select: 'schoolName division schoolName districtOrCluster',
          })
          .sort({ apn: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.immersionInfoModel.countDocuments(queryFilter),
      ]);

      const response: any = {
        success: true,
        data: immersions,
        meta: {
          count: immersions.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };

      return response;
    } catch (error) {
      this.logger.error('Error getting school needs', error.stack);
      throw error;
    }
  }

  async addImmersionVenue(
    param: string,
    immersionVenueDto: ImmersionVenueDto,
  ): Promise<any> {
    return { param: param, immersionVenueDto };
  }
}
