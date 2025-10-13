import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateEngagementDto, EngagementResponseDto } from './engagement.dto';
import { Engagement } from 'src/engagement/engagement.schema';
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
    schoolId?: string,
  ): Promise<any> {
    try {
      this.logger.log('Attempting to retrieve all engagements');

      const skip = (page - 1) * limit;
      const queryFilter: any = {};

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

      // Filter by schoolId if provided
      if (schoolId) {
        if (!Types.ObjectId.isValid(schoolId)) {
          throw new BadRequestException(`Invalid School ID: ${schoolId}`);
        }
        queryFilter.schoolId = new Types.ObjectId(schoolId);
      }

      const [engagements, total] = await Promise.all([
        this.engagementModel
          .find(queryFilter)
          .populate({
            path: 'schoolNeedId',
            select:
              'code description schoolId schoolYear specificContribution images',
          })
          .populate({
            path: 'schoolId',
            select: 'schoolName division districtOrCluster',
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
    const { stakeholderUserId, schoolNeedId, schoolNeedCode } = engagementDto;

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
      if (!schoolNeedId && !schoolNeedCode) {
        throw new BadRequestException(
          'Either schoolNeedId or schoolNeedCode is required',
        );
      }

      let schoolNeed: SchoolNeed | null = null;

      if (schoolNeedId) {
        if (!Types.ObjectId.isValid(schoolNeedId)) {
          throw new BadRequestException(
            `Invalid School Need ID: ${schoolNeedId}`,
          );
        }
        schoolNeed = await this.schoolNeedModel.findById(schoolNeedId);
        if (!schoolNeed) {
          throw new BadRequestException(
            `School Need with ID: ${schoolNeedId} not found`,
          );
        }
      } else if (schoolNeedCode) {
        schoolNeed = await this.schoolNeedModel.findOne({
          code: schoolNeedCode,
        });
        if (!schoolNeed) {
          throw new BadRequestException(
            `School Need with code: ${schoolNeedCode} not found`,
          );
        }
      }

      const schoolNeedIdentifier = schoolNeedId
        ? `ID: ${schoolNeedId}`
        : `code: ${schoolNeedCode}`;

      if (!schoolNeed.schoolYear) {
        throw new BadRequestException(
          `School Need with ${schoolNeedIdentifier} does not have a schoolYear assigned`,
        );
      }

      if (!schoolNeed.specificContribution) {
        throw new BadRequestException(
          `School Need with ${schoolNeedIdentifier} does not have a specificContribution assigned`,
        );
      }

      if (!schoolNeed.schoolId) {
        throw new BadRequestException(
          `School Need with ${schoolNeedIdentifier} does not have a schoolId assigned`,
        );
      }

      this.logger.log(
        'Creating new Engagement with the following data:',
        engagementDto,
      );

      const createdEngagement = new this.engagementModel({
        ...engagementDto,
        schoolNeedId: schoolNeed._id, // Use the school need ID from the found school need
        schoolYear: schoolNeed.schoolYear,
        specificContribution: schoolNeed.specificContribution,
        schoolId: schoolNeed.schoolId,
      });
      const savedEngagement = await createdEngagement.save();

      this.logger.log(
        `Engagement created successfully with ID: ${savedEngagement._id.toString()}`,
      );

      const engagementObj = savedEngagement.toObject({ versionKey: false });
      const responseDto: EngagementResponseDto = {
        ...engagementObj,
        _id: savedEngagement._id.toString(),
        schoolNeedId: savedEngagement.schoolNeedId.toString(),
        stakeholderUserId: savedEngagement.stakeholderUserId,
        schoolId: savedEngagement.schoolId.toString(),
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

  async getEngagementsByStakeholder(
    stakeholderUserId: string,
    schoolYear?: string,
    page = 1,
    limit = 10,
  ): Promise<any> {
    return this.getAllEngagements(page, limit, stakeholderUserId, schoolYear);
  }

  async getEngagementsSummary(
    stakeholderUserId?: string,
    schoolYear?: string,
  ): Promise<any> {
    try {
      this.logger.log('Attempting to retrieve engagements summary');

      const matchStage: any = {};

      // Filter by stakeholder if provided
      if (stakeholderUserId) {
        if (!Types.ObjectId.isValid(stakeholderUserId)) {
          throw new BadRequestException(
            `Invalid Stakeholder ID: ${stakeholderUserId}`,
          );
        }
        matchStage.stakeholderUserId = new Types.ObjectId(stakeholderUserId);
      }

      // Filter by school year if provided, otherwise use current school year
      const filterSchoolYear = /^\d{4}-\d{4}$/.test(schoolYear || '')
        ? schoolYear
        : this.getCurrentSchoolYear();

      matchStage.schoolYear = filterSchoolYear;

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              specificContribution: '$specificContribution',
              schoolYear: '$schoolYear',
              schoolId: '$schoolId',
            },
            totalAmount: { $sum: '$amount' },
            totalQuantity: { $sum: '$quantity' },
            engagementCount: { $sum: 1 },
            engagementDates: { $push: '$createdAt' },
          },
        },
        {
          $addFields: {
            schoolIdRef: {
              $cond: {
                if: { $eq: [{ $type: '$_id.schoolId' }, 'string'] },
                then: { $toObjectId: '$_id.schoolId' },
                else: '$_id.schoolId',
              },
            },
            engagementDatesFormatted: {
              $reduce: {
                input: '$engagementDates',
                initialValue: '',
                in: {
                  $concat: [
                    '$$value',
                    {
                      $cond: {
                        if: { $eq: ['$$value', ''] },
                        then: '',
                        else: ', ',
                      },
                    },
                    { $toString: '$$this' },
                  ],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'schools',
            localField: 'schoolIdRef',
            foreignField: '_id',
            as: 'schoolData',
          },
        },
        {
          $unwind: {
            path: '$schoolData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            specificContribution: '$_id.specificContribution',
            schoolYear: '$_id.schoolYear',
            schoolId: {
              _id: '$schoolData._id',
              schoolName: '$schoolData.schoolName',
              division: '$schoolData.division',
              districtOrCluster: '$schoolData.districtOrCluster',
            },
            totalAmount: 1,
            totalQuantity: 1,
            engagementCount: 1,
            engagementDates: '$engagementDatesFormatted',
          },
        },
        {
          $sort: {
            schoolYear: 1,
            specificContribution: 1,
          },
        },
      ];

      const summary = await this.engagementModel.aggregate(pipeline).exec();

      return {
        success: true,
        data: summary,
        meta: {
          count: summary.length,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting engagements summary', error.stack);
      throw error;
    }
  }
}
