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
import { SchoolNeedDto, UpdateNeedDto } from './school-need.dto';
import { SchoolNeedDocument, SchoolNeed } from './school-need.schema';
import { Aip } from 'src/aip/aip.schema';
import { School } from 'src/schools/school.schema';
import { SchoolNeedStatus } from './school-need.enums';
import { StakeHolderEngageDto } from 'src/stakeholder-engage/stakeholder-engage.dto';

@Injectable()
export class SchoolNeedService {
  private readonly logger = new Logger(SchoolNeedService.name);

  constructor(
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,
    private readonly counterService: CounterService,
  ) {}

  async createSchoolNeed(needDto: SchoolNeedDto): Promise<SchoolNeedDocument> {
    const { projectId, schoolId } = needDto;

    try {
      // School validation
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new BadRequestException(`Invalid School Id: ${schoolId}`);
      }

      // Project validation
      if (!Types.ObjectId.isValid(projectId)) {
        throw new BadRequestException(`Invalid Project Id: ${projectId}`);
      }

      const project = await this.aipModel
        .findById(projectId)
        .select('schoolYear');
      if (!project) {
        throw new BadRequestException(
          `Project with Id: ${projectId} not found`,
        );
      }

      this.logger.log(
        'Creating new School Needs information with the following data:',
        needDto,
      );

      const statusOfImplementation = SchoolNeedStatus.LOOKING_FOR_PARTNERS;
      const code = await this.counterService.getNextSequenceValue(
        COUNTER.SCHOOL_NEED_CODE,
      );

      const createdSchoolNeed = new this.schoolNeedModel({
        ...needDto,
        code,
        statusOfImplementation,
        schoolYear: project.schoolYear,
      });

      const savedSchoolNeed = await createdSchoolNeed.save();

      this.logger.log(
        `SchoolNeed created successfully with ID: ${createdSchoolNeed._id.toString()}`,
      );
      return savedSchoolNeed;
    } catch (error) {
      this.logger.error('Error creating School Need', error.stack);
      throw error;
    }
  }

  async deleteSchoolNeed(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException(`Invalid Need ID format: ${id}`);

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete School Need with ID: ${id}`);

      const deletedSchoolNeed =
        await this.schoolNeedModel.findByIdAndDelete(objectId);
      if (!deletedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
      }

      this.logger.log(`School Need deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'School Need deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting School Need', error.stack);
      throw error;
    }
  }

  async getAll(schoolId?: string, page = 1, limit = 10, schoolYear?: string) {
    try {
      this.logger.log(`Attempting to retrieve all school Needs`);

      const skip = (page - 1) * limit;

      const queryFilter: any = {};
      if (schoolId) queryFilter.schoolId = schoolId;

      if (/^\d{4}-\d{4}$/.test(schoolYear || '')) {
        queryFilter.schoolYear = schoolYear;
      }

      const [needs, total, school] = await Promise.all([
        this.schoolNeedModel
          .find(queryFilter)
          .populate({
            path: 'projectId',
            select: 'title objectives schoolYear pillars',
          })
          .populate({
            path: 'schoolId',
            select:
              'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
          })
          .sort({ apn: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.schoolNeedModel.countDocuments(queryFilter),
        schoolId
          ? this.schoolModel
              .findById(schoolId)
              .select(
                'schoolName division districtOrCluster schoolOffering officialEmailAddress',
              )
              .lean()
          : null,
      ]);

      const response: any = {
        success: true,
        data: needs,
        meta: {
          count: needs.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };

      if (schoolId) {
        response.school = school || {};
      }

      return response;
    } catch (error) {
      this.logger.error('Error getting school needs', error.stack);
      throw error;
    }
  }

  async getSchoolNeed(param: string): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(param);
      const query = isObjectId
        ? { _id: new Types.ObjectId(param) }
        : { code: param };
      const identifierType = isObjectId ? 'ID' : 'code';

      this.logger.log(
        `Attempting to retrieve School Need with ${identifierType}: ${param}`,
      );

      const retrievedSchoolNeed = await this.schoolNeedModel
        .findOne(query)
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .populate({
          path: 'schoolId',
          select:
            'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
        })
        .exec();

      if (!retrievedSchoolNeed) {
        this.logger.warn(
          `No School Need found with ${identifierType}: ${param}`,
        );
        throw new NotFoundException(
          `School Need with ${identifierType} ${param} not found`,
        );
      }

      this.logger.log(
        `School Need retrieved successfully with ${identifierType}: ${param}`,
      );
      return {
        success: true,
        data: retrievedSchoolNeed,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting School Need by ${Types.ObjectId.isValid(param) ? 'ID' : 'code'}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateSchoolNeed(id: string, needDto: UpdateNeedDto): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update School Need with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const updatedSchoolNeed = await this.schoolNeedModel
        .findByIdAndUpdate(
          objectId,
          { $set: { ...needDto } },
          { new: true, runValidators: true },
        )
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .populate({
          path: 'schoolId',
          select:
            'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
        })
        .exec();

      if (!updatedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
      }

      this.logger.log(`School Need updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedSchoolNeed,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating SchoolNeed', error.stack);
      throw error;
    }
  }

  async updateSchoolNeedStatus(
    id: string,
    needDto: UpdateNeedDto,
  ): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update School Need status with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const updatedSchoolNeed = await this.schoolNeedModel
        .findByIdAndUpdate(
          objectId,
          { $set: { ...needDto } },
          { new: true, runValidators: true },
        )
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .exec();

      if (!updatedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
      }

      this.logger.log(`School Need updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedSchoolNeed,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating SchoolNeed', error.stack);
      throw error;
    }
  }

  async engageSchoolNeeds(
    param: string,
    stakeHolderEngageDto: StakeHolderEngageDto,
  ): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(param);
      const query = isObjectId
        ? { _id: new Types.ObjectId(param) }
        : { code: param };
      const identifierType = isObjectId ? 'ID' : 'code';
      const retrievedSchoolNeed = await this.schoolNeedModel
        .findOne(query)
        .select('_id code description')
         .exec();

      if (!retrievedSchoolNeed) {
        this.logger.warn(
          `No School Need found with ${identifierType}: ${param}`,
        );
        throw new NotFoundException(
          `School Need with ${identifierType} ${param} not found`,
        );
      }

      // Create the stakeholder engagement record 

      this.logger.log(
        `School Need engaged successfully with ${identifierType}: ${param}`,
      );

      return {
        success: 'testing',
        data: stakeHolderEngageDto,
        test: retrievedSchoolNeed,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error engaging SchoolNeed with ${Types.ObjectId.isValid(param) ? 'ID' : 'code'}`,
        error.stack,
      );
      throw error;
    }
  }
}
