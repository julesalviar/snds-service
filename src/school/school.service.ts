import { SchoolRegistrationDto } from 'src/common/dto/school-registration.dto';
import { Model } from 'mongoose';
import { School } from './school.schema';
import { PROVIDER } from '../common/constants/providers';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @Inject(PROVIDER.SCHOOL_MODEL) private readonly schoolModel: Model<School>, // Inject the custom provider
  ) {}

  // Register school
  async register(schoolRegistrationDto: SchoolRegistrationDto): Promise<any> {
    try {
      this.logger.log(
        'Registering school with the following data:',
        schoolRegistrationDto,
      );

      const createdSchool = new this.schoolModel(schoolRegistrationDto);
      const savedSchool = await createdSchool.save();
      this.logger.log(
        `School registered successfully with ID: ${savedSchool._id}`,
      );
      return savedSchool;
    } catch (error) {
      this.logger.error('Error registering school', error.stack);
      throw error;
    }
  }
}
