import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  // NotFoundException,
} from '@nestjs/common';
import {
  CreateEngagementDto,
  // UpdateEngagementDto,
  EngagementResponseDto,
} from './engagement.dto';
import { Engagement } from './engagement.schema';
import { User } from 'src/user/schemas/user.schema';
import { SchoolNeed } from 'src/school-need/school-need.schema';
import { School } from 'src/schools/school.schema';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

  private getCurrentSchoolYear(): string {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = January

    // Determine the base school year
    // If current month is May (4) or later, we're in the school year that started last calendar year
    // Calculate the school year range
    const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;

    return `${startYear}-${endYear}`;
  }

  constructor(
    @Inject(PROVIDER.ENGAGEMENT_MODEL)
    private readonly engagementModel: Model<Engagement>,

    @Inject(PROVIDER.USER_MODEL)
    private readonly userModel: Model<User>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,
  ) {}

  async getAllEngagements(
    page = 1,
    limit = 10,
    stakeholderUserId?: string,
    schoolYear?: string,
    specificContribution?: string,
  ): Promise<any> {
    try {
      this.logger.log('Attempting to retrieve all engagements');

      const skip = (page - 1) * limit;
      const queryFilter: any = {};

      // Filter by stakeholder if provided
      if (stakeholderUserId) {
        if (!Types.ObjectId.isValid(stakeholderUserId)) {
          throw new BadRequestException(
            `Invalid Stakeholder ID: ${stakeholderUserId}`,
          );
        }
        queryFilter.stakeholderUserId = new Types.ObjectId(stakeholderUserId);
      }

      // Determine the school year to filter by
      const filterSchoolYear = /^\d{4}-\d{4}$/.test(schoolYear || '')
        ? schoolYear
        : this.getCurrentSchoolYear();

      // Filter directly on engagement.schoolYear (denormalized field)
      queryFilter.schoolYear = filterSchoolYear;

      // Filter by specificContribution if provided
      if (specificContribution) {
        queryFilter.specificContribution = specificContribution;
      }

      const [engagements, total] = await Promise.all([
        this.engagementModel
          .find(queryFilter)
          .populate({
            path: 'schoolNeedId',
            select: 'code description schoolId schoolYear specificContribution',
            populate: {
              path: 'schoolId',
              select: 'schoolName division districtOrCluster',
            },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.engagementModel.countDocuments(queryFilter),
      ]);

      const transformedEngagements = engagements.map((engagement) => {
        const engagementObj = engagement.toObject({ versionKey: false });
        return {
          ...engagementObj,
          _id: engagement._id.toString(),
        };
      });

      return {
        success: true,
        data: transformedEngagements,
        meta: {
          count: engagements.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting engagements', error.stack);
      throw error;
    }
  }

  async createEngagement(engagementDto: CreateEngagementDto): Promise<any> {
    const { stakeholderUserId, schoolNeedId } = engagementDto;

    try {
      if (!Types.ObjectId.isValid(stakeholderUserId)) {
        throw new BadRequestException(
          `Invalid Stakeholder ID: ${stakeholderUserId}`,
        );
      }

      const stakeholder = await this.userModel.findById(stakeholderUserId);
      if (!stakeholder) {
        throw new BadRequestException(
          `Stakeholder with ID: ${stakeholderUserId} not found`,
        );
      }

      // Validate and fetch school need to get schoolYear
      if (!schoolNeedId) {
        throw new BadRequestException('schoolNeedId is required');
      }

      if (!Types.ObjectId.isValid(schoolNeedId)) {
        throw new BadRequestException(
          `Invalid School Need ID: ${schoolNeedId}`,
        );
      }

      const schoolNeed = await this.schoolNeedModel.findById(schoolNeedId);
      if (!schoolNeed) {
        throw new BadRequestException(
          `School Need with ID: ${schoolNeedId} not found`,
        );
      }

      if (!schoolNeed.schoolYear) {
        throw new BadRequestException(
          `School Need with ID: ${schoolNeedId} does not have a schoolYear assigned`,
        );
      }

      if (!schoolNeed.specificContribution) {
        throw new BadRequestException(
          `School Need with ID: ${schoolNeedId} does not have a specificContribution assigned`,
        );
      }

      this.logger.log(
        'Creating new Engagement with the following data:',
        engagementDto,
      );

      const createdEngagement = new this.engagementModel({
        ...engagementDto,
        schoolYear: schoolNeed.schoolYear,
        specificContribution: schoolNeed.specificContribution,
      });
      const savedEngagement = await createdEngagement.save();

      this.logger.log(
        `Engagement created successfully with ID: ${savedEngagement._id.toString()}`,
      );

      const responseDto: EngagementResponseDto = {
        ...savedEngagement.toObject({ versionKey: false }),
        _id: savedEngagement._id.toString(),
        schoolNeedId: savedEngagement.schoolNeedId.toString(),
        stakeholderUserId: savedEngagement.stakeholderUserId.toString(),
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error creating Engagement', error.stack);
      throw error;
    }
  }

  // async getEngagementById(id: string): Promise<any> {
  //   try {
  //     if (!Types.ObjectId.isValid(id)) {
  //       throw new BadRequestException(`Invalid Engagement ID: ${id}`);
  //     }
  //
  //     this.logger.log(`Attempting to retrieve Engagement with ID: ${id}`);
  //
  //     const engagement = await this.engagementModel
  //       .findById(id)
  //       .populate({
  //         path: 'stakeholderId',
  //         select: 'userName firstName lastName email role',
  //       })
  //       .populate({
  //         path: 'schoolNeedId',
  //         select: 'code description schoolId',
  //         populate: {
  //           path: 'schoolId',
  //           select: 'schoolName division districtOrCluster',
  //         },
  //       })
  //       .exec();
  //
  //     if (!engagement) {
  //       this.logger.warn(`No Engagement found with ID: ${id}`);
  //       throw new NotFoundException(`Engagement with ID ${id} not found`);
  //     }
  //
  //     this.logger.log(`Engagement retrieved successfully with ID: ${id}`);
  //
  //     const engagementObj = engagement.toObject({ versionKey: false });
  //     const responseDto: EngagementResponseDto = {
  //       ...engagementObj,
  //       _id: engagement._id.toString(),
  //       createdAt: engagement.createdAt,
  //       updatedAt: engagement.updatedAt,
  //     };
  //
  //     return {
  //       success: true,
  //       data: responseDto,
  //       meta: {
  //         timestamp: new Date(),
  //       },
  //     };
  //   } catch (error) {
  //     this.logger.error('Error getting engagement', error.stack);
  //     throw error;
  //   }
  // }
  //
  // async updateEngagement(
  //   id: string,
  //   updateDto: UpdateEngagementDto,
  // ): Promise<any> {
  //   try {
  //     if (!Types.ObjectId.isValid(id)) {
  //       throw new BadRequestException(`Invalid Engagement ID: ${id}`);
  //     }
  //
  //     this.logger.log(`Attempting to update Engagement with ID: ${id}`);
  //
  //     const { stakeholderId, schoolNeedId, ...updateData } = updateDto;
  //
  //     // Validate stakeholder if provided
  //     if (stakeholderId) {
  //       if (!Types.ObjectId.isValid(stakeholderId)) {
  //         throw new BadRequestException(
  //           `Invalid Stakeholder ID: ${stakeholderId}`,
  //         );
  //       }
  //       const stakeholder = await this.userModel.findById(stakeholderId);
  //       if (!stakeholder) {
  //         throw new BadRequestException(
  //           `Stakeholder with ID: ${stakeholderId} not found`,
  //         );
  //       }
  //     }
  //
  //     // Validate school need if provided
  //     if (schoolNeedId) {
  //       if (!Types.ObjectId.isValid(schoolNeedId)) {
  //         throw new BadRequestException(
  //           `Invalid School Need ID: ${schoolNeedId}`,
  //         );
  //       }
  //       const schoolNeed = await this.schoolNeedModel.findById(schoolNeedId);
  //       if (!schoolNeed) {
  //         throw new BadRequestException(
  //           `School Need with ID: ${schoolNeedId} not found`,
  //         );
  //       }
  //     }
  //
  //     const objectId = new Types.ObjectId(id);
  //     const updatedEngagement = await this.engagementModel
  //       .findByIdAndUpdate(
  //         objectId,
  //         { $set: updateDto },
  //         { new: true, runValidators: true },
  //       )
  //       .populate({
  //         path: 'stakeholderId',
  //         select: 'userName firstName lastName email role',
  //       })
  //       .populate({
  //         path: 'schoolNeedId',
  //         select: 'code description schoolId',
  //         populate: {
  //           path: 'schoolId',
  //           select: 'schoolName division districtOrCluster',
  //         },
  //       })
  //       .exec();
  //
  //     if (!updatedEngagement) {
  //       this.logger.warn(`No Engagement found with ID: ${objectId}`);
  //       throw new NotFoundException(
  //         `Engagement with ID ${objectId} not found`,
  //       );
  //     }
  //
  //     this.logger.log(`Engagement updated successfully with ID: ${objectId}`);
  //
  //     const engagementObj = updatedEngagement.toObject({ versionKey: false });
  //     const responseDto: EngagementResponseDto = {
  //       ...engagementObj,
  //       _id: updatedEngagement._id.toString(),
  //       createdAt: updatedEngagement.createdAt,
  //       updatedAt: updatedEngagement.updatedAt,
  //     };
  //
  //     return {
  //       success: true,
  //       data: responseDto,
  //       meta: {
  //         timestamp: new Date(),
  //       },
  //     };
  //   } catch (error) {
  //     if (error.name === 'CastError') {
  //       throw new BadRequestException(`Invalid ID format: ${id}`);
  //     }
  //
  //     this.logger.error('Error updating engagement', error.stack);
  //     throw error;
  //   }
  // }
  //
  // async deleteEngagement(id: string): Promise<any> {
  //   try {
  //     if (!Types.ObjectId.isValid(id)) {
  //       throw new BadRequestException(`Invalid Engagement ID: ${id}`);
  //     }
  //
  //     const objectId = new Types.ObjectId(id);
  //     this.logger.log(`Attempting to delete Engagement with ID: ${id}`);
  //
  //     const deletedEngagement = await this.engagementModel.findByIdAndDelete(
  //       objectId,
  //     );
  //
  //     if (!deletedEngagement) {
  //       this.logger.warn(`No Engagement found with ID: ${objectId}`);
  //       throw new NotFoundException(
  //         `Engagement with ID ${objectId} not found`,
  //       );
  //     }
  //
  //     this.logger.log(`Engagement deleted successfully with ID: ${objectId}`);
  //
  //     return {
  //       success: true,
  //       data: { message: 'Engagement deleted successfully', objectId },
  //       meta: {
  //         timestamp: new Date(),
  //       },
  //     };
  //   } catch (error) {
  //     if (error.name === 'CastError') {
  //       throw new BadRequestException(`Invalid ID format: ${id}`);
  //     }
  //
  //     this.logger.error('Error deleting engagement', error.stack);
  //     throw error;
  //   }
  // }

  async getEngagementsByStakeholder(
    stakeholderUserId: string,
    page = 1,
    limit = 10,
  ): Promise<any> {
    return this.getAllEngagements(page, limit, stakeholderUserId);
  }
}
