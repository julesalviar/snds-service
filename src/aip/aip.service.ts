import { Model, Types } from 'mongoose';
import { PROVIDER } from '../common/constants/providers';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AipDto } from 'src/aip/aip.dto';
import { Aip, AipDocument } from './aip.schema';
import { CounterService } from 'src/common/counter/counter.services';

@Injectable()
export class AipService {
  private readonly logger = new Logger(AipService.name);

  constructor(
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>, // Inject the custom provider
    private readonly counterService: CounterService,
  ) {}

  // Create a New AIP
  async createAip(aipDto: AipDto): Promise<AipDocument> {
    try {
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
      this.logger.error('Error creating AIP', error.stack);
      throw error;
    }
  }

  async getAll(page = 1, limit = 10) {
    try {
      this.logger.log(
        `Attempting to retrieve paginated AIPs: page = ${page}, limit = ${limit}`,
      );

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.aipModel.find().sort({ apn: -1 }).skip(skip).limit(limit).exec(),
        this.aipModel.countDocuments(),
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
      const retrievedAip = await this.aipModel.findById(objectId);
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
