import { OfficeDto, UpdateOfficeDto } from './office.dto';
import { Model, Types } from 'mongoose';
import { Office, OfficeDocument } from './office.schema';
import { PpaPlan } from 'src/ppa-plan/ppa-plan.schema';
import { PROVIDER } from '../common/constants/providers';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class OfficeService {
  private readonly logger = new Logger(OfficeService.name);

  constructor(
    @Inject(PROVIDER.OFFICE_MODEL)
    private readonly officeModel: Model<Office>,
    @Inject(PROVIDER.PPA_PLAN_MODEL)
    private readonly ppaPlanModel: Model<PpaPlan>,
  ) {}

  async create(officeCreateDto: OfficeDto): Promise<OfficeDocument> {
    try {
      this.logger.log(
        'Creating office with the following data:',
        officeCreateDto,
      );

      const createdOffice = new this.officeModel(officeCreateDto);
      const savedOffice = await createdOffice.save();
      this.logger.log(
        `Office created successfully with ID: ${savedOffice._id}`,
      );
      return savedOffice;
    } catch (error) {
      this.logger.error('Error creating office', error.stack);

      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue).join(', ');
        throw new BadRequestException(
          `Duplicate entry for field(s): ${duplicateField}`,
        );
      }
      throw error;
    }
  }

  async deleteOffice(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException(`Invalid office ID format: ${id}`);

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete office with ID: ${id}`);

      const deletedOffice = await this.officeModel.findByIdAndDelete(objectId);
      if (!deletedOffice) {
        this.logger.warn(`No office found with ID: ${objectId}`);
        throw new NotFoundException(`Office with ID ${objectId} not found`);
      }

      this.logger.log(`Office deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'Office deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting office', error.stack);
      throw error;
    }
  }

  async updateOffice(
    id: string,
    officeUpdateDto: UpdateOfficeDto,
  ): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update office with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const updatedOffice = await this.officeModel
        .findByIdAndUpdate(
          objectId,
          { $set: { ...officeUpdateDto } },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedOffice) {
        this.logger.warn(`No office found with ID: ${objectId}`);
        throw new NotFoundException(`Office with ID ${objectId} not found`);
      }

      this.logger.log(`Office updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedOffice,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating office', error.stack);
      throw error;
    }
  }

  async getAll(
    page: number,
    limit: number,
    search?: string,
    division?: string,
    includePpaPlanCount = false,
  ) {
    try {
      this.logger.log(
        `Attempting to retrieve all paginated offices: page = ${page}, limit = ${limit}, search = ${search || 'none'}, division = ${division || 'none'}, includePpaPlanCount = ${includePpaPlanCount}`,
      );

      const skip = (page - 1) * limit;
      const filter: any = {};

      if (division) {
        filter.division = division;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { division: { $regex: search, $options: 'i' } },
        ];
      }

      const [offices, total] = await Promise.all([
        this.officeModel
          .find(filter)
          .sort({ name: 'asc' })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.officeModel.countDocuments(filter),
      ]);

      let data: any[] = offices;

      if (includePpaPlanCount && offices.length > 0) {
        const officeIds = offices.map((o) => o._id);

        const ppaPlanCounts = await this.ppaPlanModel.aggregate([
          { $match: { officeId: { $in: officeIds } } },
          { $group: { _id: '$officeId', ppaPlanCount: { $sum: 1 } } },
        ]);

        const countMap = new Map(
          ppaPlanCounts.map((item) => [item._id.toString(), item.ppaPlanCount]),
        );

        data = offices.map((office) => ({
          ...office.toObject(),
          ppaPlanCount: countMap.get(office._id.toString()) ?? 0,
        }));
      }

      return {
        success: true,
        data,
        meta: {
          count: offices.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          search: search || 'none',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting offices', error.stack);
      throw error;
    }
  }

  async getOfficeById(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to retrieve office with ID: ${id}`);
      const objectId = new Types.ObjectId(id);
      const retrievedOffice = await this.officeModel.findById(objectId).exec();

      if (!retrievedOffice) {
        this.logger.warn(`No office found with ID: ${objectId}`);
        throw new NotFoundException(`Office with ID ${objectId} not found`);
      }

      return {
        success: true,
        data: retrievedOffice,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error getting office by id', error.stack);
      throw error;
    }
  }
}
