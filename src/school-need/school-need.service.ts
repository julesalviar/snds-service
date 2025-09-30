import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { COUNTER } from 'src/common/constants/counters';
import { CounterService } from 'src/common/counter/counter.services';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  SchoolNeedDto,
  SchoolNeedResponseDto,
  SchoolUpdateNeedDto,
} from './school-need.dto';
import { SchoolNeed } from './school-need.schema';
import { Aip } from 'src/aip/aip.schema';
import { School } from 'src/schools/school.schema';
import { SchoolNeedStatus } from './school-need.enums';
import { StakeHolderEngageDto } from 'src/school-need/stakeholder-engage.dto';

@Injectable()
export class SchoolNeedService {
  private readonly logger = new Logger(SchoolNeedService.name);

  /**
   * Get current school year based on current date
   * School year runs from June to May, so if current month is May or later,
   * we're in the school year that started the previous calendar year
   */
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
    @Inject(PROVIDER.AIP_MODEL)
    private readonly aipModel: Model<Aip>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,
    private readonly counterService: CounterService,
  ) {}

  async createSchoolNeed(needDto: SchoolNeedDto): Promise<any> {
    const { projectId, schoolId } = needDto;

    try {
      // School validation
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new BadRequestException(`Invalid School Id: ${schoolId}`);
      }

      // Project validation
      if (!Types.ObjectId.isValid(projectId)) {
        throw new BadRequestException(`Invalid Project Id: ${projectId}`);
      }

      const project = await this.aipModel
        .findById(projectId)
        .select('schoolYear');
      if (!project) {
        throw new BadRequestException(
          `Project with Id: ${projectId} not found`,
        );
      }

      this.logger.log(
        'Creating new School Needs information with the following data:',
        needDto,
      );

      const statusOfImplementation = SchoolNeedStatus.LOOKING_FOR_PARTNERS;
      const code = await this.counterService.getNextSequenceValue(
        COUNTER.SCHOOL_NEED_CODE,
      );

      const createdSchoolNeed = new this.schoolNeedModel({
        ...needDto,
        code,
        statusOfImplementation,
        schoolYear: project.schoolYear,
      });

      const savedSchoolNeed = await createdSchoolNeed.save();

      this.logger.log(
        `SchoolNeed created successfully with ID: ${createdSchoolNeed._id.toString()}`,
      );

      const responseDto: SchoolNeedResponseDto = {
        ...savedSchoolNeed.toObject({ versionKey: false }),
        _id: savedSchoolNeed._id.toString(),
        createdAt: savedSchoolNeed.createdAt,
        updatedAt: savedSchoolNeed.updatedAt,
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error creating School Need', error.stack);
      throw error;
    }
  }

  async deleteSchoolNeed(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException(`Invalid Need ID format: ${id}`);

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete School Need with ID: ${id}`);

      const deletedSchoolNeed =
        await this.schoolNeedModel.findByIdAndDelete(objectId);
      if (!deletedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
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

  async getAll(
    schoolId?: string,
    page = 1,
    limit = 10,
    schoolYear?: string,
    specificContribution?: string,
  ) {
    try {
      this.logger.log(`Attempting to retrieve all school Needs`);

      const skip = (page - 1) * limit;

      const queryFilter: any = {};
      if (schoolId) queryFilter.schoolId = schoolId;

      // Use provided schoolYear if valid, otherwise use current school year
      if (/^\d{4}-\d{4}$/.test(schoolYear || '')) {
        queryFilter.schoolYear = schoolYear;
      } else {
        queryFilter.schoolYear = this.getCurrentSchoolYear();
      }

      if (specificContribution) {
        queryFilter.specificContribution = {
          $regex: specificContribution,
          $options: 'i',
        };
      }

      const [needs, total, totalBySchool, school, totalQuantityResult] =
        await Promise.all([
          this.schoolNeedModel
            .find(queryFilter)
            .populate({
              path: 'projectId',
              select: 'title objectives schoolYear pillars',
            })
            .populate({
              path: 'schoolId',
              select:
                'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
          this.schoolNeedModel.countDocuments(queryFilter),
          this.schoolNeedModel
            .aggregate([
              { $match: queryFilter },
              { $group: { _id: '$schoolId' } },
              { $count: 'totalBySchool' },
            ])
            .exec(),
          schoolId
            ? this.schoolModel
                .findById(schoolId)
                .select(
                  'schoolName division districtOrCluster schoolOffering officialEmailAddress',
                )
                .lean()
            : null,
          specificContribution
            ? this.schoolNeedModel
                .aggregate([
                  { $match: queryFilter },
                  {
                    $addFields: {
                      quantityAsNumber: {
                        $cond: [
                          {
                            $and: [
                              { $ne: ['$quantity', null] },
                              { $ne: ['$quantity', ''] },
                              {
                                $or: [
                                  { $eq: [{ $type: '$quantity' }, 'number'] },
                                  { $eq: [{ $type: '$quantity' }, 'int'] },
                                  { $eq: [{ $type: '$quantity' }, 'long'] },
                                  { $eq: [{ $type: '$quantity' }, 'double'] },
                                  { $eq: [{ $type: '$quantity' }, 'decimal'] },
                                ],
                              },
                            ],
                          },
                          { $toDouble: '$quantity' },
                          0,
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      totalQuantity: { $sum: '$quantityAsNumber' },
                    },
                  },
                ])
                .exec()
            : null,
        ]);

      const transformedNeeds = needs.map((need) => {
        const needObj = need.toObject({ versionKey: false });
        const { schoolId, ...restNeedObj } = needObj;
        return {
          ...restNeedObj,
          _id: need._id.toString(),
          createdAt: need.createdAt,
          updatedAt: need.updatedAt,
          school: schoolId, // Rename schoolId to school
        };
      });

      // Extract totalBySchool from aggregation result (counts distinct schools from entire filtered dataset)
      const totalBySchoolCount =
        totalBySchool.length > 0 ? totalBySchool[0].totalBySchool : 0;

      // Extract totalQuantity from aggregation result when specificContribution is provided
      const totalQuantity =
        specificContribution &&
        totalQuantityResult &&
        totalQuantityResult.length > 0
          ? totalQuantityResult[0].totalQuantity || 0
          : undefined;

      const response: any = {
        success: true,
        data: transformedNeeds,
        meta: {
          count: needs.length,
          totalItems: total,
          totalBySchool: totalBySchoolCount,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };

      // Add totalQuantity to meta if specificContribution is provided
      if (totalQuantity !== undefined) {
        response.meta.totalQuantity = totalQuantity;
      }

      if (schoolId) {
        response.school = school || {};
      }

      return response;
    } catch (error) {
      this.logger.error('Error getting school needs', error.stack);
      throw error;
    }
  }

  async getSchoolNeed(param: string): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(param);
      const query = isObjectId
        ? { _id: new Types.ObjectId(param) }
        : { code: param };
      const identifierType = isObjectId ? 'ID' : 'code';

      this.logger.log(
        `Attempting to retrieve School Need with ${identifierType}: ${param}`,
      );

      const retrievedSchoolNeed = await this.schoolNeedModel
        .findOne(query)
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .populate({
          path: 'schoolId',
          select:
            'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
        })
        .exec();

      if (!retrievedSchoolNeed) {
        this.logger.warn(
          `No School Need found with ${identifierType}: ${param}`,
        );
        throw new NotFoundException(
          `School Need with ${identifierType} ${param} not found`,
        );
      }

      this.logger.log(
        `School Need retrieved successfully with ${identifierType}: ${param}`,
      );

      const needObj = retrievedSchoolNeed.toObject({ versionKey: false });
      const { schoolId, ...restNeedObj } = needObj;
      const responseDto: SchoolNeedResponseDto = {
        ...restNeedObj,
        _id: retrievedSchoolNeed._id.toString(),
        createdAt: retrievedSchoolNeed.createdAt,
        updatedAt: retrievedSchoolNeed.updatedAt,
        school: schoolId, // Rename schoolId to school
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting School Need by ${Types.ObjectId.isValid(param) ? 'ID' : 'code'}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateSchoolNeed(
    id: string,
    needDto: SchoolUpdateNeedDto,
  ): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update School Need with ID: ${id}`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, code, ...secureUpdateData } =
        needDto as any;

      const objectId = new Types.ObjectId(id);
      const updatedSchoolNeed = await this.schoolNeedModel
        .findByIdAndUpdate(
          objectId,
          { $set: secureUpdateData },
          { new: true, runValidators: true },
        )
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .populate({
          path: 'schoolId',
          select:
            'schoolName division schoolName districtOrCluster schoolOffering officialEmailAddress',
        })
        .exec();

      if (!updatedSchoolNeed) {
        this.logger.warn(`No School Need found with ID: ${objectId}`);
        throw new NotFoundException(
          `School Need with ID ${objectId} not found`,
        );
      }

      this.logger.log(`School Need updated successfully with ID: ${objectId}`);

      const needObj = updatedSchoolNeed.toObject({ versionKey: false });
      const { schoolId, ...restNeedObj } = needObj;
      const responseDto: SchoolNeedResponseDto = {
        ...restNeedObj,
        _id: updatedSchoolNeed._id.toString(),
        createdAt: updatedSchoolNeed.createdAt,
        updatedAt: updatedSchoolNeed.updatedAt,
        school: schoolId, // Rename schoolId to school
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating SchoolNeed', error.stack);
      throw error;
    }
  }

  async updateSchoolNeedStatus(
    id: string,
    needDto: SchoolUpdateNeedDto,
  ): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: new Types.ObjectId(id) } : { code: id };
      const identifierType = isObjectId ? 'ID' : 'code';
      this.logger.log(
        `Attempting to update School Need status with ${identifierType}: ${id}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, code, ...secureUpdateData } =
        needDto as any;

      const updatedSchoolNeed = await this.schoolNeedModel
        .findOneAndUpdate(
          query,
          { $set: secureUpdateData },
          { new: true, runValidators: true },
        )
        .populate({
          path: 'projectId',
          select: 'title objectives schoolYear pillars',
        })
        .exec();

      if (!updatedSchoolNeed) {
        this.logger.warn(`No School Need found with ${identifierType}: ${id}`);
        throw new NotFoundException(
          `School Need with ${identifierType}:  ? 'ID' : 'code' : ${id} not found`,
        );
      }

      this.logger.log(
        `School Need updated successfully with ${identifierType}: ${id}`,
      );

      const needObj = updatedSchoolNeed.toObject({ versionKey: false });
      const { schoolId, ...restNeedObj } = needObj;
      const responseDto: SchoolNeedResponseDto = {
        ...restNeedObj,
        _id: updatedSchoolNeed._id.toString(),
        createdAt: updatedSchoolNeed.createdAt,
        updatedAt: updatedSchoolNeed.updatedAt,
        school: schoolId, // Rename schoolId to school
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating SchoolNeed', error.stack);
      throw error;
    }
  }

  async engageSchoolNeeds(
    param: string,
    stakeHolderEngageDto: StakeHolderEngageDto,
  ): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(param);
      const query = isObjectId
        ? { _id: new Types.ObjectId(param) }
        : { code: param };

      const identifierType = isObjectId ? 'ID' : 'code';
      const retrievedSchoolNeed = await this.schoolNeedModel
        .findOne(query)
        .exec();

      if (!retrievedSchoolNeed) {
        this.logger.warn(
          `No School Need found with ${identifierType}: ${param}`,
        );
        throw new NotFoundException(
          `School Need with ${identifierType} ${param} not found`,
        );
      }

      if (!retrievedSchoolNeed.engagement) {
        retrievedSchoolNeed.engagement = [];
      }

      retrievedSchoolNeed.engagement.push(stakeHolderEngageDto);
      retrievedSchoolNeed.markModified('engagement');
      await retrievedSchoolNeed.save();

      this.logger.log(
        `School Need engaged successfully with ${identifierType}: ${param}`,
      );

      const needObj = retrievedSchoolNeed.toObject({ versionKey: false });
      const { schoolId, ...restNeedObj } = needObj;
      const responseDto: SchoolNeedResponseDto = {
        ...restNeedObj,
        _id: retrievedSchoolNeed._id.toString(),
        createdAt: retrievedSchoolNeed.createdAt,
        updatedAt: retrievedSchoolNeed.updatedAt,
        school: schoolId, // Rename schoolId to school
      };

      return {
        success: true,
        data: responseDto,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error engaging SchoolNeed with ${Types.ObjectId.isValid(param) ? 'ID' : 'code'}`,
        error.stack,
      );
      throw error;
    }
  }
  async getStakeholderContributions(
    stakeholderId: string,
    page = 1,
    limit = 10,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const [stakeholderContributions, total] = await Promise.all([
        this.schoolNeedModel
          .find({
            'engagement.stakeholderId': stakeholderId,
          })
          .select('_id code description schoolId engagement')
          .populate({
            path: 'schoolId',
            select: 'schoolName division schoolName districtOrCluster  ',
          })
          .sort({ code: 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.schoolNeedModel.countDocuments({
          'engagement.stakeholderId': stakeholderId,
        }),
      ]);

      const _stakeholderId = stakeholderId;
      const formattedContributions = stakeholderContributions.map((needDoc) => {
        const need = needDoc.toObject();
        const myEngagements = need.engagement.filter((e) => {
          return e.stakeholderId == _stakeholderId;
        });

        return {
          _id: need._id,
          schoolId: need.schoolId,
          code: need.code,
          description: need.description,
          myEngagements,
        };
      });

      const totalDonatedAmt = formattedContributions
        .flatMap((n) => n.myEngagements)
        .reduce((sum, e) => {
          return sum + (Number(e.donatedAmount) || 0);
        }, 0);

      const numberOfSchools = new Set(
        formattedContributions.map((n) => {
          return n.schoolId?._id?.toString() || n.schoolId;
        }),
      ).size;

      const summary = { totalDonatedAmt, numberOfSchools };

      return {
        success: true,
        data: formattedContributions,
        meta: {
          summary,
          count: stakeholderContributions.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error getting school needs', error.stack);
      throw error;
    }
  }
}
