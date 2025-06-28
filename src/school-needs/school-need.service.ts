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
import { NeedDto } from './school-need.dto';
import {
  SchoolNeedSchema,
  SchoolNeedDocument,
  SchoolNeed,
} from './school-need.schema';

@Injectable()
export class SchoolNeedService {
  private readonly logger = new Logger(SchoolNeedService.name);

  constructor(
    @Inject(PROVIDER.AIP_MODEL)
    private readonly SchoolNeedModel: Model<SchoolNeed>,

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
          `Invalid Project / SchoolNeed Id: ${[projectObjId]}`,
        );

      const SchoolNeedExists = await this.SchoolNeedModel.exists({ _id: projectObjId });
      if (!SchoolNeedExists)
        throw new BadRequestException(
          `SchoolNeed / Project with Id: ${[projectObjId]} not found`,
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
        `SchoolNeed created successfully with ID: ${createdSchoolNeed._id}`,
      );
      return savedSchoolNeed;
    } catch (error) {
      this.logger.error('Error creating School Need', error.stack);
      throw error;
    }
  }

     async deleteSchoolNeed(schoolId: string, id: string): Promise<any> {
         try {
             
             // School ID validations
             if (!Types.ObjectId.isValid(schoolId)) throw new BadRequestException(`Invalid School ID format: ${schoolId}`);

             if (!Types.ObjectId.isValid(id)) throw new BadRequestException(`Invalid Need ID format: ${id}`);
          
          const objectId = new Types.ObjectId(id);
          this.logger.log(`Attempting to delete School Need with ID: ${id}`);

          const deletedSchoolNeed = await this.schoolNeedModel.findByIdAndDelete(objectId);
          if (!deletedSchoolNeed) {
              this.logger.warn(`No School Need found with ID: ${objectId}`);
              throw new NotFoundException(`School Need with ID ${objectId} not found`);
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
    
    
  // async getAll() {
  //     try {
  //         this.logger.log(`Attempting to retrieve all SchoolNeeds`);
  //         const allSchoolNeeds = await this.SchoolNeedModel.find().exec();

  //         return {
  //             success: true,
  //             data: allSchoolNeeds,
  //             meta: {
  //                 count: allSchoolNeeds.length,
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         this.logger.error('Error getting SchoolNeeds', error.stack);
  //         throw error;
  //     }
  // }

  // async getSchoolNeedById(id: string): Promise<any> {
  //     try {
  //         if (!Types.ObjectId.isValid(id)) {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         const objectId = new Types.ObjectId(id);

  //         this.logger.log(`Attempting to retrieve SchoolNeed with ID: ${id}`);
  //         const retrievedSchoolNeed = await this.SchoolNeedModel.findById(objectId);
  //         if (!retrievedSchoolNeed) {
  //             this.logger.warn(`No SchoolNeed found with ID: ${objectId}`);
  //             throw new NotFoundException(`SchoolNeed with ID ${objectId} not found`);
  //         }

  //         this.logger.log(`SchoolNeed retrieved successfully with ID: ${objectId}`);
  //         return {
  //             success: true,
  //             data: retrievedSchoolNeed,
  //             meta: {
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         if (error.name === 'CastError') {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         this.logger.error('Error getting SchoolNeed by Id', error.stack);
  //         throw error;
  //     }
  // }

 

  // async updateSchoolNeed(id: string, needDto: needDto): Promise<any> {
  //     try {
  //         if (!Types.ObjectId.isValid(id)) {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }
  //         const objectId = new Types.ObjectId(id);

  //         this.logger.log(`Attempting to update SchoolNeed with ID: ${id}`);
  //         const updatedSchoolNeed = await this.SchoolNeedModel.findByIdAndUpdate(
  //             objectId,
  //             { $set: { ...needDto } },
  //             { new: true, runValidators: true },
  //         );

  //         if (!updatedSchoolNeed) {
  //             this.logger.warn(`No SchoolNeed found with ID: ${objectId}`);
  //             throw new NotFoundException(`SchoolNeed with ID ${objectId} not found`);
  //         }

  //         this.logger.log(`SchoolNeed updated successfully with ID: ${objectId}`);
  //         return {
  //             success: true,
  //             data: updatedSchoolNeed,
  //             meta: {
  //                 timestamp: new Date(),
  //             },
  //         };
  //     } catch (error) {
  //         if (error.name === 'CastError') {
  //             throw new BadRequestException(`Invalid ID format: ${id}`);
  //         }

  //         this.logger.error('Error updating SchoolNeed', error.stack);
  //         throw error;
  //     }
  // }
}
