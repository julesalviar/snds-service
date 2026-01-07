import { SchoolDto, UpdateSchoolDto } from './school.dto';
import { Model, Types } from 'mongoose';
import { School, SchoolDocument } from './school.schema';
import { SchoolNeed } from '../school-need/school-need.schema';
import { Aip } from '../aip/aip.schema';
import { PROVIDER } from '../common/constants/providers';
import { getCurrentSchoolYear } from '../common/utils/school-year.util';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,
    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>,
  ) {}

  // Create school
  async create(schoolCreateDto: SchoolDto): Promise<SchoolDocument> {
    try {
      this.logger.log(
        'Registering school with the following data:',
        schoolCreateDto,
      );

      const createdSchool = new this.schoolModel(schoolCreateDto);
      const savedSchool = await createdSchool.save();
      this.logger.log(
        `School registered successfully with ID: ${savedSchool._id}`,
      );
      return savedSchool;
    } catch (error) {
      this.logger.error('Error registering school', error.stack);

      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue).join(', ');
        throw new BadRequestException(
          `Duplicate entry for field(s): ${duplicateField}`,
        );
      }
      throw error;
    }
  }

  async deleteSchool(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException(`Invalid school ID format: ${id}`);

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete school with ID: ${id}`);

      const deletedSchool = await this.schoolModel.findByIdAndDelete(objectId);
      if (!deletedSchool) {
        this.logger.warn(`No school found with ID: ${objectId}`);
        throw new NotFoundException(`School with ID ${objectId} not found`);
      }

      this.logger.log(`School deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'School  deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting School', error.stack);
      throw error;
    }
  }

  async updateSchool(
    id: string,
    schoolUpdateDto: UpdateSchoolDto,
  ): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update School with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const updatedSchool = await this.schoolModel
        .findByIdAndUpdate(
          objectId,
          { $set: { ...schoolUpdateDto } },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedSchool) {
        this.logger.warn(`No School found with ID: ${objectId}`);
        throw new NotFoundException(`School with ID ${objectId} not found`);
      }

      this.logger.log(`School updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedSchool,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating School', error.stack);
      throw error;
    }
  }

  async getAll(
    page: number,
    limit: number,
    district?: string,
    search?: string,
    withNeedCount: boolean = false,
    withAipCount: boolean = false,
    schoolYear?: string,
  ) {
    try {
      this.logger.log(
        `Attempting to retrieve all paginated schools: page = ${page}, limit = ${limit}, district = ${district || 'all'}, search = ${search || 'none'}, withNeedCount = ${withNeedCount}, withAipCount = ${withAipCount}, schoolYear = ${schoolYear || 'none'}`,
      );

      const skip = (page - 1) * limit;

      const filter: any = {};

      // District filter
      if (district) {
        filter.districtOrCluster = { $regex: new RegExp(`^${district}$`, 'i') };
      }

      // Search filter - searches across multiple fields
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        const searchConditions: any[] = [
          { schoolName: searchRegex },
          { accountablePerson: searchRegex },
        ];

        // Only search schoolId if the search term is numeric
        const numericSearch = Number(search);
        if (!isNaN(numericSearch) && isFinite(numericSearch)) {
          searchConditions.push({ schoolId: numericSearch });
        }

        filter.$or = searchConditions;
      }

      const [schools, total] = await Promise.all([
        this.schoolModel
          .find(filter)
          .sort({ schoolName: 'asc' })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.schoolModel.countDocuments(filter),
      ]);

      if (!/^\d{4}-\d{4}$/.test(schoolYear || '')) {
        schoolYear = getCurrentSchoolYear();
      }

      let schoolsWithNeeds: any[] = schools;

      // Add school need counts if requested
      if (withNeedCount && schools.length > 0) {
        // Convert school ObjectIds to strings for comparison
        const schoolIds = schools.map((school) => school._id.toString());

        const needCounts = await this.schoolNeedModel.aggregate([
          {
            $match: {
              schoolId: { $in: schoolIds },
              schoolYear: schoolYear,
            },
          },
          {
            $group: {
              _id: '$schoolId',
              totalNeed: { $sum: 1 },
              completedNeed: {
                $sum: {
                  $cond: [
                    { $eq: ['$implementationStatus', 'Completed'] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const needCountMap = new Map();
        needCounts.forEach((item) => {
          needCountMap.set(item._id, {
            totalNeed: item.totalNeed,
            completedNeed: item.completedNeed,
          });
        });

        schoolsWithNeeds = schools.map((school) => {
          const needData = needCountMap.get(school._id.toString()) ?? {
            totalNeed: 0,
            completedNeed: 0,
          };
          return {
            ...school.toObject(),
            additionalInfo: {
              totalNeed: needData.totalNeed,
              completedNeed: needData.completedNeed,
            },
          };
        });
      }

      // Add AIP counts if requested
      if (withAipCount && schools.length > 0 && schoolYear) {
        const schoolIds = schools.map((school) => school._id.toString());

        const aipCounts = await this.aipModel.aggregate([
          {
            $match: {
              schoolId: { $in: schoolIds },
              schoolYear: schoolYear,
            },
          },
          {
            $group: {
              _id: '$schoolId',
              totalAip: { $sum: 1 },
              completedAip: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
                },
              },
            },
          },
        ]);

        const aipCountMap = new Map();
        aipCounts.forEach((item) => {
          aipCountMap.set(item._id.toString(), {
            totalAip: item.totalAip,
            completedAip: item.completedAip,
          });
        });

        schoolsWithNeeds = schoolsWithNeeds.map((school) => {
          const aipData = aipCountMap.get(school._id.toString()) ?? {
            totalAip: 0,
            completedAip: 0,
          };
          return {
            ...school,
            additionalInfo: {
              ...(school.additionalInfo ?? {}),
              totalAip: aipData.totalAip,
              completedAip: aipData.completedAip,
            },
          };
        });
      }

      return {
        success: true,
        data: schoolsWithNeeds,
        meta: {
          count: schools.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          district: district || 'all',
          search: search || 'none',
          withNeedCount,
          withAipCount,
          schoolYear: schoolYear || 'none',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting schools', error.stack);
      throw error;
    }
  }

  async getSchoolById(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to retrieve School with ID: ${id}`);
      const objectId = new Types.ObjectId(id);
      const retrievedSchool = await this.schoolModel.findById(objectId).exec();

      if (!retrievedSchool) {
        this.logger.warn(`No School found with ID: ${objectId}`);
        throw new NotFoundException(`School with ID ${objectId} not found`);
      }

      return {
        success: true,
        data: retrievedSchool,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error getting School by Id', error.stack);
      throw error;
    }
  }

  async getSchoolBySchoolId(schoolId: string): Promise<any> {
    try {
      this.logger.log(
        `Attempting to retrieve School with School ID: ${schoolId}`,
      );
      const retrievedSchool = await this.schoolModel
        .findOne({ schoolId })
        .exec();

      if (!retrievedSchool) {
        this.logger.warn(`No School found with ID: ${schoolId}`);
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      return {
        success: true,
        data: retrievedSchool,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting School by Id', error.stack);
      throw error;
    }
  }
}
