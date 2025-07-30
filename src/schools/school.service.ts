// import { SchoolDto } from 'src/common/dto/school.dto';
import { SchoolDto } from './school.dto';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './school.schema';
import { PROVIDER } from '../common/constants/providers';
import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from 'src/encryption/encryption.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @Inject(PROVIDER.SCHOOL_MODEL) private readonly schoolModel: Model<School>, // Inject the custom provider
  ) {}

  // Register school
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

  async getAll(page: number, limit: number) {
    try {
      this.logger.log(
        `Attempting to retrieve all paginated schools: page = ${page}, limit = ${limit}`,
      );

      const skip = (page - 1) * limit;
      const [schools, total] = await Promise.all([
        this.schoolModel
          .find()
          .sort({ schoolId: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.schoolModel.countDocuments(),
      ]);
      return {
        success: true,
        data: schools,
        meta: {
          count: schools.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting schools', error.stack);
      throw error;
    }
  }
}
