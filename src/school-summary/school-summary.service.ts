import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { SchoolSummary, SchoolSummarySchema } from './school-summary.schema';
import {
  SchoolNeed,
  SchoolNeedSchema,
} from '../school-need/school-need.schema';
import { Engagement, EngagementSchema } from '../engagement/engagement.schema';
import { School } from '../schools/school.schema';
import { PROVIDER } from '../common/constants/providers';

@Injectable()
export class SchoolSummaryService {
  constructor(
    @Inject(PROVIDER.SCHOOL_SUMMARY_MODEL)
    private readonly schoolSummaryModel: Model<SchoolSummary>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<School>,

    @Inject(PROVIDER.SCHOOL_NEED_MODEL)
    private readonly schoolNeedModel: Model<SchoolNeed>,

    @Inject(PROVIDER.ENGAGEMENT_MODEL)
    private readonly engagementModel: Model<Engagement>,
  ) {}

  /**
   * Core function to recalculate and update school summary
   * This is used by middleware in SchoolNeed and Engagement schemas
   */
  static async updateSchoolSummary(
    schoolId: Types.ObjectId,
    schoolYear: string | null, // null means update ALL_TIME
    doc: any,
  ) {
    try {
      let SchoolSummaryModel;
      let SchoolNeedModel;
      let EngagementModel;

      // Register models if not already registered
      try {
        SchoolSummaryModel = doc.db.model('SchoolSummary');
      } catch (error) {
        SchoolSummaryModel = doc.db.model('SchoolSummary', SchoolSummarySchema);
      }

      try {
        SchoolNeedModel = doc.db.model('SchoolNeed');
      } catch (error) {
        SchoolNeedModel = doc.db.model('SchoolNeed', SchoolNeedSchema);
      }

      try {
        EngagementModel = doc.db.model('Engagement');
      } catch (error) {
        EngagementModel = doc.db.model('Engagement', EngagementSchema);
      }

      // Build query filters
      const needFilter: any = { schoolId: schoolId.toString() };
      const engagementFilter: any = { schoolId: schoolId.toString() };
      const aipFilter: any = { schoolId: schoolId.toString() };
      const summaryYear = schoolYear ?? 'ALL_TIME';

      if (schoolYear) {
        needFilter.schoolYear = schoolYear;
        engagementFilter.schoolYear = schoolYear;
        aipFilter.schoolYear = schoolYear;
      }

      // Aggregate school needs - handle null/undefined quantities
      const needAggregation = await SchoolNeedModel.aggregate([
        { $match: needFilter },
        {
          $group: {
            _id: null,
            totalQuantity: {
              $sum: {
                $ifNull: ['$quantity', 0],
              },
            },
            count: { $sum: 1 },
          },
        },
      ]).exec();

      const totalNeedQuantity = needAggregation[0]?.totalQuantity ?? 0;
      const needCount = needAggregation[0]?.count ?? 0;

      // Aggregate engagements
      const engagementAggregation = await EngagementModel.aggregate([
        { $match: engagementFilter },
        {
          $group: {
            _id: null,
            totalQuantity: {
              $sum: {
                $ifNull: ['$quantity', 0],
              },
            },
            count: { $sum: 1 },
          },
        },
      ]).exec();

      // Aggregate AIP
      const aipAggregation = await EngagementModel.aggregate([
        { $match: { ...engagementFilter } },
        {
          $group: {
            _id: {
              schoolId: '$schoolId',
              schoolYear: '$schoolYear',
            },
            count: { $sum: 1 },
          },
        },
      ]).exec();

      const totalEngagementQuantity =
        engagementAggregation[0]?.totalQuantity ?? 0;
      const engagementCount = engagementAggregation[0]?.count ?? 0;
      const aipCount = aipAggregation[0]?.count ?? 0;

      console.log('AIPCount:' + aipCount);

      // Calculate accomplishment percentage
      const accomplishmentPercentage =
        totalNeedQuantity > 0
          ? Math.min((totalEngagementQuantity / totalNeedQuantity) * 100, 100)
          : 0;

      // Upsert summary document with optimistic locking
      await SchoolSummaryModel.findOneAndUpdate(
        { schoolId, schoolYear: summaryYear },
        {
          $set: {
            totalNeedQuantity,
            totalEngagementQuantity,
            accomplishmentPercentage:
              Math.round(accomplishmentPercentage * 100) / 100, // Round to 2 decimals
            needCount,
            engagementCount,
            aipCount,
          },
          $inc: { version: 1 }, // Optimistic locking
        },
        { upsert: true, new: true },
      ).exec();
    } catch (error) {
      console.error('Error updating school summary:', error);
      // Silently fail to avoid breaking the main operation
    }
  }

  /**
   * Get all schools summary for a specific school year
   */
  async getSchoolsSummary(
    schoolYear: string,
    division?: string,
    districtOrCluster?: string,
  ) {
    const summaries = await this.schoolSummaryModel
      .find({ schoolYear })
      .lean()
      .exec();

    // Get school details with filters
    const schoolFilter: any = {
      _id: { $in: summaries.map((s) => s.schoolId) },
    };

    if (division) {
      schoolFilter.division = division;
    }

    if (districtOrCluster) {
      schoolFilter.districtOrCluster = districtOrCluster;
    }

    const schools = await this.schoolModel.find(schoolFilter).lean().exec();

    const schoolMap = new Map(schools.map((s) => [s._id.toString(), s]));

    // Filter summaries to only include schools that match the filters
    return summaries
      .filter((summary) => schoolMap.has(summary.schoolId.toString()))
      .map((summary) => {
        const school = schoolMap.get(summary.schoolId.toString());
        return {
          schoolId: summary.schoolId.toString(),
          schoolName: school?.schoolName || 'Unknown',
          division: school?.division,
          districtOrCluster: school?.districtOrCluster,
          accomplishmentPercentage: summary.accomplishmentPercentage,
          numberOfNeeds: summary.totalNeedQuantity,
          engagementCount: summary.engagementCount,
        };
      });
  }

  /**
   * Get detailed summary for a specific school (current year + all time)
   */
  async getSchoolDetailedSummary(schoolId: string, currentSchoolYear: string) {
    const summaries = await this.schoolSummaryModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        schoolYear: { $in: [currentSchoolYear, 'ALL_TIME'] },
      })
      .lean()
      .exec();

    const school = await this.schoolModel.findById(schoolId).lean().exec();

    const currentYearSummary = summaries.find(
      (s) => s.schoolYear === currentSchoolYear,
    );
    const allTimeSummary = summaries.find((s) => s.schoolYear === 'ALL_TIME');

    return {
      schoolId,
      schoolName: school?.schoolName || 'Unknown',
      division: school?.division,
      districtOrCluster: school?.districtOrCluster,
      currentYear: {
        accomplishmentPercentage:
          currentYearSummary?.accomplishmentPercentage || 0,
        numberOfNeeds: currentYearSummary?.totalNeedQuantity || 0,
        engagementCount: currentYearSummary?.engagementCount || 0,
        aipCount: currentYearSummary?.aipCount || 0,
      },
      allTime: {
        totalAccomplishmentPercentage:
          allTimeSummary?.accomplishmentPercentage || 0,
        totalNumberOfNeeds: allTimeSummary?.totalNeedQuantity || 0,
        totalEngagementCount: allTimeSummary?.engagementCount || 0,
      },
    };
  }

  /**
   * Get all schools summary with both current year and all time data (for dashboard)
   */
  async getAllSchoolsSummaryForDashboard(
    currentSchoolYear: string,
    division?: string,
    districtOrCluster?: string,
  ) {
    // Build match filter for schools
    const schoolMatchFilter: any = {};
    if (division) {
      schoolMatchFilter['school.division'] = division;
    }
    if (districtOrCluster) {
      schoolMatchFilter['school.districtOrCluster'] = districtOrCluster;
    }

    const summaries = await this.schoolSummaryModel
      .aggregate([
        {
          $match: {
            schoolYear: { $in: [currentSchoolYear, 'ALL_TIME'] },
          },
        },
        {
          $group: {
            _id: '$schoolId',
            currentYearData: {
              $push: {
                $cond: [
                  { $eq: ['$schoolYear', currentSchoolYear] },
                  {
                    accomplishment: '$accomplishmentPercentage',
                    needs: '$totalNeedQuantity',
                    engagements: '$engagementCount',
                  },
                  null,
                ],
              },
            },
            allTimeData: {
              $push: {
                $cond: [
                  { $eq: ['$schoolYear', 'ALL_TIME'] },
                  {
                    accomplishment: '$accomplishmentPercentage',
                    needs: '$totalNeedQuantity',
                    engagements: '$engagementCount',
                  },
                  null,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'schools',
            localField: '_id',
            foreignField: '_id',
            as: 'school',
          },
        },
        {
          $unwind: {
            path: '$school',
            preserveNullAndEmptyArrays: true,
          },
        },
        ...(Object.keys(schoolMatchFilter).length > 0
          ? [{ $match: schoolMatchFilter }]
          : []),
        {
          $project: {
            schoolId: '$_id',
            schoolName: '$school.schoolName',
            division: '$school.division',
            districtOrCluster: '$school.districtOrCluster',
            currentYear: {
              accomplishmentPercentage: {
                $ifNull: [
                  { $arrayElemAt: ['$currentYearData.accomplishment', 0] },
                  0,
                ],
              },
              numberOfNeeds: {
                $ifNull: [{ $arrayElemAt: ['$currentYearData.needs', 0] }, 0],
              },
              engagementCount: {
                $ifNull: [
                  { $arrayElemAt: ['$currentYearData.engagements', 0] },
                  0,
                ],
              },
            },
            allTime: {
              totalAccomplishmentPercentage: {
                $ifNull: [
                  { $arrayElemAt: ['$allTimeData.accomplishment', 0] },
                  0,
                ],
              },
              totalNumberOfNeeds: {
                $ifNull: [{ $arrayElemAt: ['$allTimeData.needs', 0] }, 0],
              },
              totalEngagementCount: {
                $ifNull: [{ $arrayElemAt: ['$allTimeData.engagements', 0] }, 0],
              },
            },
          },
        },
        {
          $sort: { schoolName: 1 },
        },
      ])
      .exec();

    return summaries;
  }

  /**
   * Initialize summaries for existing data (migration utility)
   */
  async initializeSchoolSummaries() {
    const schools = await this.schoolModel.find().lean().exec();
    const results = {
      processed: 0,
      errors: [] as string[],
    };

    for (const school of schools) {
      try {
        // Get all unique school years for this school
        const schoolYears = await this.schoolNeedModel.distinct('schoolYear', {
          schoolId: school._id.toString(),
        });
        console.log(school);
        console.log(schoolYears);

        // Get connection from the model
        const connection = this.schoolNeedModel.db;

        // Update summary for each school year
        for (const year of schoolYears.filter((y) => y)) {
          await SchoolSummaryService.updateSchoolSummary(
            school._id as Types.ObjectId,
            year,
            { db: connection },
          );
        }

        // Update ALL_TIME summary
        await SchoolSummaryService.updateSchoolSummary(
          school._id as Types.ObjectId,
          null,
          { db: connection },
        );

        results.processed++;
      } catch (error) {
        results.errors.push(
          `Error processing school ${school._id}: ${error.message}`,
        );
      }
    }

    return results;
  }

  /**
   * Recalculate a specific school summary (useful for fixing inconsistencies)
   */
  async recalculateSchoolSummary(schoolId: string, schoolYear?: string) {
    // Get connection from the model
    const connection = this.schoolNeedModel.db;

    if (schoolYear) {
      // Recalculate specific school year
      await SchoolSummaryService.updateSchoolSummary(
        new Types.ObjectId(schoolId),
        schoolYear,
        { db: connection },
      );
    } else {
      // Recalculate all years for this school
      const schoolYears = await this.schoolNeedModel.distinct('schoolYear', {
        schoolId: new Types.ObjectId(schoolId),
      });

      for (const year of schoolYears.filter((y) => y)) {
        await SchoolSummaryService.updateSchoolSummary(
          new Types.ObjectId(schoolId),
          year,
          { db: connection },
        );
      }

      // Update ALL_TIME
      await SchoolSummaryService.updateSchoolSummary(
        new Types.ObjectId(schoolId),
        null,
        { db: connection },
      );
    }

    return { success: true, message: 'Summary recalculated successfully' };
  }
}
