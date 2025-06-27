import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { CounterService } from 'src/common/counter/counter.services';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NeedDto } from './need.dto';
import {
  SchoolNeedSchema,
  SchoolNeedDocument,
  SchoolNeed,
} from './need.schema';
import { Aip } from 'src/aip/aip.schema';

@Injectable()
export class SchoolNeedService {
  private readonly logger = new Logger(SchoolNeedService.name);

  constructor(
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,
    private counterService: CounterService,
  ) {}

  // Create a School Need
  async createSchoolNeed(schoolId: String, needDto: NeedDto): Promise<any> {
    const { projectObjId } = needDto;
    try {
      //   @todo:  School exist validation

      // AIP / Project Id validations
      if (!Types.ObjectId.isValid(projectObjId))
        throw new BadRequestException(
          `Invalid Project / AIP Id: ${[projectObjId]}`,
        );

      const aipExists = await this.aipModel.exists({ _id: projectObjId });
      if (!aipExists)
        throw new BadRequestException(
          `AIP / Project with Id: ${[projectObjId]} not found`,
        );

      this.logger.log(
        'Creating new School Needs information with the following data:',
        needDto,
      );
      const code =
        await this.counterService.getNextSequenceValue('schoolNeedsCode');

      const createdSchoolNeed = new this.schoolNeedModel({ ...needDto, code });
      const savedSchoolNeed = await createdSchoolNeed.save();

      this.logger.log(
        `AIP created successfully with ID: ${createdSchoolNeed._id}`,
      );
      return savedSchoolNeed;
    } catch (error) {
      this.logger.error('Error creating School Need', error.stack);
      throw error;
    }
  }

  // async getAll() {
  //     try {
  //         this.logger.log(`Attempting to retrieve all AIPs`);
  //         const allAips = await this.aipModel.find().exec();

  //         return {
  //             success: true,
  //             data: allAips,
  //             meta: {
  //                 count: allAips.length,
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         this.logger.error('Error getting AIPs', error.stack);
  //         throw error;
  //     }
  // }

  // async getAipById(id: string): Promise<any> {
  //     try {
  //         if (!Types.ObjectId.isValid(id)) {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         const objectId = new Types.ObjectId(id);

  //         this.logger.log(`Attempting to retrieve AIP with ID: ${id}`);
  //         const retrievedAip = await this.aipModel.findById(objectId);
  //         if (!retrievedAip) {
  //             this.logger.warn(`No AIP found with ID: ${objectId}`);
  //             throw new NotFoundException(`AIP with ID ${objectId} not found`);
  //         }

  //         this.logger.log(`AIP retrieved successfully with ID: ${objectId}`);
  //         return {
  //             success: true,
  //             data: retrievedAip,
  //             meta: {
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         if (error.name === 'CastError') {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         this.logger.error('Error getting AIP by Id', error.stack);
  //         throw error;
  //     }
  // }

  // async deleteAip(id: string): Promise<any> {
  //     try {
  //         if (!Types.ObjectId.isValid(id)) {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }
  //         const objectId = new Types.ObjectId(id);

  //         this.logger.log(`Attempting to delete AIP with ID: ${id}`);
  //         const deletedAip = await this.aipModel.findByIdAndDelete(objectId);
  //         if (!deletedAip) {
  //             this.logger.warn(`No AIP found with ID: ${objectId}`);
  //             throw new NotFoundException(`AIP with ID ${objectId} not found`);
  //         }

  //         this.logger.log(`AIP deleted successfully with ID: ${objectId}`);

  //         return {
  //             success: true,
  //             data: { message: 'AIP deleted successfully', objectId },
  //             meta: {
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         if (error.name === 'CastError') {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         this.logger.error('Error deleting AIP', error.stack);
  //         throw error;
  //     }
  // }

  // async updateAip(id: string, needDto: needDto): Promise<any> {
  //     try {
  //         if (!Types.ObjectId.isValid(id)) {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }
  //         const objectId = new Types.ObjectId(id);

  //         this.logger.log(`Attempting to update AIP with ID: ${id}`);
  //         const updatedAip = await this.aipModel.findByIdAndUpdate(
  //             objectId,
  //             { $set: { ...needDto } },
  //             { new: true, runValidators: true },
  //         );

  //         if (!updatedAip) {
  //             this.logger.warn(`No AIP found with ID: ${objectId}`);
  //             throw new NotFoundException(`AIP with ID ${objectId} not found`);
  //         }

  //         this.logger.log(`AIP updated successfully with ID: ${objectId}`);
  //         return {
  //             success: true,
  //             data: updatedAip,
  //             meta: {
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         if (error.name === 'CastError') {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         this.logger.error('Error updating AIP', error.stack);
  //         throw error;
  //     }
  // }
}
