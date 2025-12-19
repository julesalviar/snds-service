import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { getCurrentSchoolYear } from 'src/common/utils/school-year.util';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEngagementDto, EngagementResponseDto } from './engagement.dto';
import { Engagement } from 'src/engagement/engagement.schema';
import { User } from 'src/user/schemas/user.schema';
import { SchoolNeed } from 'src/school-need/school-need.schema';
import { School } from 'src/schools/school.schema';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

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
    startDate?: string,
    endDate?: string,
    sector?: string,
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

      // Filter by sector if provided
      // Sector can be multiple values (comma-separated)
      if (sector) {
        const sectors = sector
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (sectors.length > 0) {
          // Find users with matching sectors
          const usersWithSector = await this.userModel
            .find({ sector: { $in: sectors } })
            .select('_id')
            .exec();

          const userIds = usersWithSector.map((user) => user._id);

          if (userIds.length === 0) {
            // No users found with the specified sectors, return empty result
            return {
              success: true,
              data: [],
              meta: {
                count: 0,
                totalItems: 0,
                totalAmount: 0,
                currentPage: page,
                totalPages: 0,
                timestamp: new Date(),
              },
            };
          }

          // If stakeholderUserId is already set, intersect with sector filter
          if (queryFilter.stakeholderUserId) {
            if (!userIds.includes(queryFilter.stakeholderUserId)) {
              // The specified stakeholderUserId doesn't match the sector filter
              return {
                success: true,
                data: [],
                meta: {
                  count: 0,
                  totalItems: 0,
                  totalAmount: 0,
                  currentPage: page,
                  totalPages: 0,
                  timestamp: new Date(),
                },
              };
            }
          } else {
            // Filter engagements by stakeholder user IDs that match the sectors
            queryFilter.stakeholderUserId = { $in: userIds };
          }
        }
      }

      // Filter directly on engagement.schoolYear (denormalized field)
      queryFilter.schoolYear = /^\d{4}-\d{4}$/.test(schoolYear || '')
        ? schoolYear
        : getCurrentSchoolYear();

      // Filter by specificContribution if provided
      if (specificContribution) {
        queryFilter.specificContribution = specificContribution;
      }

      // Filter by schoolId if provided
      // Handle both string and ObjectId formats in the database
      if (schoolId) {
        if (!Types.ObjectId.isValid(schoolId)) {
          throw new BadRequestException(`Invalid School ID: ${schoolId}`);
        }
        queryFilter.schoolId = {
          $in: [schoolId, new Types.ObjectId(schoolId)],
        };
      }

      // Filter by date range if provided
      // Find engagements where startDate falls within the requested date range
      // Query dates are in plain string format but represent UTC+8 timezone
      // Since startDate/endDate are stored as ISO strings, we compare them as strings
      if (startDate || endDate) {
        const startDateFilter: any = { $exists: true };

        if (startDate) {
          // Parse date string as UTC+8 (e.g., "2025-01-01" means "2025-01-01 00:00:00 +08:00")
          // Create date string with explicit UTC+8 timezone
          const dateStr = startDate.includes('T')
            ? startDate
            : `${startDate}T00:00:00+08:00`;
          const start = new Date(dateStr);
          if (isNaN(start.getTime())) {
            throw new BadRequestException(
              `Invalid startDate format: ${startDate}. Expected date string (YYYY-MM-DD).`,
            );
          }
          // Date is now in UTC, convert to ISO string
          startDateFilter.$gte = start.toISOString();
        }

        if (endDate) {
          // Parse date string as UTC+8 (e.g., "2025-12-15" means "2025-12-15 23:59:59 +08:00")
          // Create date string with explicit UTC+8 timezone
          const dateStr = endDate.includes('T')
            ? endDate
            : `${endDate}T23:59:59+08:00`;
          const end = new Date(dateStr);
          if (isNaN(end.getTime())) {
            throw new BadRequestException(
              `Invalid endDate format: ${endDate}. Expected date string (YYYY-MM-DD).`,
            );
          }
          // Date is now in UTC, convert to ISO string
          startDateFilter.$lte = end.toISOString();
        }

        queryFilter.startDate = startDateFilter;
      }

      const [engagements, total, totalAmountResult] = await Promise.all([
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
          .populate({
            path: 'stakeholderUserId',
            select:
              'name firstName lastName email userName role activeRole sector',
          })
          .sort({ startDate: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.engagementModel.countDocuments(queryFilter),
        this.engagementModel.aggregate([
          { $match: queryFilter },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
            },
          },
        ]),
      ]);

      const transformedEngagements = engagements.map((engagement) => {
        const engagementObj = engagement.toObject({ versionKey: false });
        return {
          ...engagementObj,
          _id: engagement._id.toString(),
        };
      });

      const totalAmount =
        totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

      return {
        success: true,
        data: transformedEngagements,
        meta: {
          count: engagements.length,
          totalItems: total,
          totalAmount: totalAmount,
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
        stakeholderUserId: new Types.ObjectId(stakeholderUserId),
        schoolNeedId: schoolNeed._id,
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
      matchStage.schoolYear = /^\d{4}-\d{4}$/.test(schoolYear || '')
        ? schoolYear
        : getCurrentSchoolYear();

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

  async deleteEngagement(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      const objectId = new Types.ObjectId(id);

      this.logger.log(`Attempting to delete Engagement with ID: ${id}`);

      const deletedEngagement =
        await this.engagementModel.findByIdAndDelete(objectId);
      if (!deletedEngagement) {
        this.logger.warn(`No Engagement found with ID: ${objectId}`);
        throw new NotFoundException(`Engagement with ID ${objectId} not found`);
      }

      this.logger.log(`Engagement deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'Engagement deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting Engagement', error.stack);
      throw error;
    }
  }
}
