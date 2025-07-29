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
import { School } from './school.schema';
import { SchoolNeedStatus } from './school-need.enums';

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
    const { projectObjId, schoolObjId } = needDto;
    try {
      // School validation
      if (!Types.ObjectId.isValid(schoolObjId))
        throw new BadRequestException(`Invalid School Id: ${[schoolObjId]}`);

      // AIP / Project Id validations
      if (!Types.ObjectId.isValid(projectObjId))
        throw new BadRequestException(
          `Invalid Project / SchoolNeed Id: ${[projectObjId]}`,
        );

      const aipExists = await this.aipModel.exists({
        _id: projectObjId,
      });

      if (!aipExists)
        throw new BadRequestException(
          `SchoolNeed / Project with Id: ${[projectObjId]} not found`,
        );

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
      });
      const savedSchoolNeed = await createdSchoolNeed.save();

      this.logger.log(
        `SchoolNeed created successfully with ID: ${createdSchoolNeed._id}`,
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

  async getAll(page: number, limit: number) {
    try {
      this.logger.log(
        `Attempting to retrieve all paginated school Needs: page = ${page}, limit = ${limit}`,
      );

      const skip = (page - 1) * limit;
      const [schoolNeeds, total] = await Promise.all([
        this.schoolNeedModel
          .find()
          .sort({ code: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'projectObjId',
            select: 'title objectives schoolYear pillars',
          })
          .populate({
            path: 'schoolObjId',
            select:
              'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
          })
          .exec(),
        this.schoolNeedModel.countDocuments(),
      ]);
      return {
        success: true,
        data: schoolNeeds,
        meta: {
          count: schoolNeeds.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting school needs', error.stack);
      throw error;
    }
  }

  async getSchoolNeedById(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to retrieve School Need with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const retrievedSchoolNeed = await this.schoolNeedModel
        .findById(objectId)
        .populate({
          path: 'projectObjId',
          select: 'title objectives schoolYear pillars',
        })
        .populate({
          path: 'schoolObjId',
          select:
            'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
        })
        .exec();

      if (!retrievedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
      }

      this.logger.log(
        `School Need retrieved successfully with ID: ${objectId}`,
      );
      return {
        success: true,
        data: retrievedSchoolNeed,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error getting School Need by Id', error.stack);
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
          path: 'projectObjId',
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
          path: 'projectObjId',
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
}
