import { Model, Types } from 'mongoose';
import { PROVIDER } from '../common/constants/providers';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { AipDto } from 'src/aip/aip.dto';
import { Aip, AipDocument } from './aip.schema';
import { School } from 'src/schools/school.schema';
import { SchoolNeed } from 'src/school-need/school-need.schema';
import { CounterService } from 'src/common/counter/counter.services';

@Injectable()
export class AipService {
  private readonly logger = new Logger(AipService.name);

  constructor(
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,

    private readonly counterService: CounterService,
  ) {}

  /**
   * This TypeScript function creates a new AIP document with data provided in the AipDto object,
   * assigns schoolId and createdBy values from the currentUser object, and saves the document to the
   * database.
   * @param {AipDto} aipDto - AipDto is an object containing data for creating a new AIP (Assessment
   * and Intervention Plan). It likely includes information such as student details, assessment
   * results, intervention strategies, and other relevant data needed for creating the AIP.
   * @param {any} currentUser - The `currentUser` parameter is an object that represents the current
   * user making the request. It likely contains information about the user, such as their school ID
   * and user ID. In the provided code snippet, the `schoolId` and `userId` are extracted from the
   * `currentUser` object to be used
   * @returns The `createAip` function is returning a Promise that resolves to an `AipDocument` object,
   * which represents the AIP (Annual Implementation Plan) that was created and saved in the database.
   */
  async createAip(aipDto: AipDto, currentUser: any): Promise<AipDocument> {
    try {
      const schoolId = currentUser.schoolId;
      const createdBy = currentUser.userId;
      if (!schoolId) {
        throw new BadRequestException(
          `No school ID found where this user is under to `,
        );
      }
      aipDto = { ...aipDto, schoolId: schoolId, createdBy: createdBy };
      this.logger.log(
        'Creating new AIP information with the following data:',
        aipDto,
      );

      const apn = await this.counterService.getNextSequenceValue('aip');
      const createdAip = new this.aipModel({ ...aipDto, apn });
      const savedAip = await createdAip.save();

      this.logger.log(`AIP created successfully with ID: ${createdAip?.apn}`);
      return savedAip;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Title already exists for this school.');
      }
      this.logger.error('Error creating AIP', error.stack);
      throw error;
    }
  }

  async getAll(schoolId?: string, schoolYear?: string, page = 1, limit = 10) {
    try {
      this.logger.log(
        `Attempting to retrieve paginated AIPs: page = ${page}, limit = ${limit}`,
      );
      const skip = (page - 1) * limit;
      const queryFilter: any = {};
      if (schoolId) queryFilter.schoolId = schoolId;
      if (/^\d{4}-\d{4}$/.test(schoolYear || '')) {
        queryFilter.schoolYear = schoolYear;
      }

      const [data, total] = await Promise.all([
        this.aipModel
          .find(queryFilter)
          .populate({
            path: 'schoolId',
            select:
              'schoolId schoolName districtOrCluster division accountablePerson contactNumber contactNumber officialEmailAddress',
          })
          .sort({ apn: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.aipModel.countDocuments(queryFilter),
      ]);

      return {
        success: true,
        data,
        meta: {
          count: data.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting AIPs', error.stack);
      throw error;
    }
  }

  async getAipById(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const objectId = new Types.ObjectId(id);

      this.logger.log(`Attempting to retrieve AIP with ID: ${id}`);
      const retrievedAip = await this.aipModel
        .findById(objectId)
        .populate({
          path: 'schoolId',
          select:
            'schoolId schoolName districtOrCluster division accountablePerson contactNumber contactNumber officialEmailAddress',
        })
        .exec();
      if (!retrievedAip) {
        this.logger.warn(`No AIP found with ID: ${objectId}`);
        throw new NotFoundException(`AIP with ID ${objectId} not found`);
      }

      this.logger.log(`AIP retrieved successfully with ID: ${objectId}`);
      return {
        success: true,
        data: retrievedAip,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error getting AIP by Id', error.stack);
      throw error;
    }
  }

  async deleteAip(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      const objectId = new Types.ObjectId(id);

      this.logger.log(`Attempting to delete AIP with ID: ${id}`);

      // Check if there are existing school needs linked to this AIP
      const linkedSchoolNeeds = await this.schoolNeedModel
        .countDocuments({ projectId: id })
        .exec();

      if (linkedSchoolNeeds > 0) {
        this.logger.warn(
          `Cannot delete AIP with ID: ${objectId}. Found ${linkedSchoolNeeds} linked school need(s).`,
        );
        throw new BadRequestException(
          `Cannot delete AIP. There are ${linkedSchoolNeeds} school need(s) linked to this AIP. Please remove or reassign the school needs first.`,
        );
      }

      const deletedAip = await this.aipModel.findByIdAndDelete(objectId);
      if (!deletedAip) {
        this.logger.warn(`No AIP found with ID: ${objectId}`);
        throw new NotFoundException(`AIP with ID ${objectId} not found`);
      }

      this.logger.log(`AIP deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'AIP deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting AIP', error.stack);
      throw error;
    }
  }

  async updateAip(id: string, aipDto: AipDto): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      const objectId = new Types.ObjectId(id);

      this.logger.log(`Attempting to update AIP with ID: ${id}`);
      const updatedAip = await this.aipModel.findByIdAndUpdate(
        objectId,
        { $set: { ...aipDto } },
        { new: true, runValidators: true },
      );

      if (!updatedAip) {
        this.logger.warn(`No AIP found with ID: ${objectId}`);
        throw new NotFoundException(`AIP with ID ${objectId} not found`);
      }

      this.logger.log(`AIP updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedAip,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating AIP', error.stack);
      throw error;
    }
  }
}
