import { Schema, Types } from 'mongoose';

import { AipStatus } from '../aip/aip-status.enum';
import { AipSchema } from '../aip/aip.schema';
import { EngagementSchema } from '../engagement/engagement.schema';
import { ImplementationStatus } from './implementation-status.enum';

interface UpdateAipStatusOptions {
  SchoolNeedSchema?: Schema;
  AipSchema?: Schema;
  EngagementSchema?: Schema;
}

export async function updateAipStatus(
  aipId: Types.ObjectId,
  doc: any,
  options: UpdateAipStatusOptions = {},
) {
  const {
    SchoolNeedSchema: schoolNeedSchemaOption,
    AipSchema: aipSchemaOption,
    EngagementSchema: engagementSchemaOption,
  } = options;

  try {
    let AipModel;
    let SchoolNeedModel;
    let EngagementModel;

    try {
      AipModel = doc.db.model('Aip');
    } catch (error) {
      console.log(error);
      AipModel = doc.db.model('Aip', aipSchemaOption ?? AipSchema);
    }

    try {
      SchoolNeedModel = doc.db.model('SchoolNeed');
    } catch (error) {
      console.log(error);
      if (!schoolNeedSchemaOption) {
        throw new Error('SchoolNeedSchema is required to register the model');
      }
      SchoolNeedModel = doc.db.model('SchoolNeed', schoolNeedSchemaOption);
    }

    try {
      EngagementModel = doc.db.model('Engagement');
    } catch (error) {
      console.log(error);
      EngagementModel = doc.db.model(
        'Engagement',
        engagementSchemaOption ?? EngagementSchema,
      );
    }

    const schoolNeeds = await SchoolNeedModel.find({
      projectId: aipId,
    }).exec();

    if (!schoolNeeds || schoolNeeds.length === 0) {
      await AipModel.findByIdAndUpdate(aipId, {
        status: AipStatus.FOR_IMPLEMENTATION,
      });
      return;
    }

    const aip = await AipModel.findById(aipId).exec();
    if (!aip) return;

    const completedCount = schoolNeeds.filter(
      (need) => need.implementationStatus === ImplementationStatus.COMPLETED,
    ).length;

    const totalCount = schoolNeeds.length;

    // Parse school year and determine if current date is within or after school year
    const schoolYearMatch = aip.schoolYear?.match(/^(\d{4})-(\d{4})$/);
    if (!schoolYearMatch) {
      // If no valid school year, default to FOR_IMPLEMENTATION
      await AipModel.findByIdAndUpdate(aipId, {
        status: AipStatus.FOR_IMPLEMENTATION,
      });
      return;
    }

    const endYear = parseInt(schoolYearMatch[2]);
    const schoolYearEndDate = new Date(endYear, 4, 31); // May 31st of end year
    const currentDate = new Date();

    // Check if current date is after school year end date
    const isAfterSchoolYear = currentDate > schoolYearEndDate;

    if (isAfterSchoolYear) {
      // After school year: COMPLETED, UNIMPLEMENTED, or INCOMPLETE
      if (completedCount === totalCount) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.COMPLETED,
        });
        return;
      }

      if (completedCount === 0) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.UNIMPLEMENTED,
        });
        return;
      }

      await AipModel.findByIdAndUpdate(aipId, {
        status: AipStatus.INCOMPLETE,
      });
      return;
    } else {
      const schoolNeedIds = schoolNeeds.map((need) => need._id);
      const engagements = await EngagementModel.find({
        schoolNeedId: { $in: schoolNeedIds },
      }).exec();

      if (completedCount === totalCount) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.COMPLETED,
        });
        return;
      }

      if (engagements && engagements.length > 0) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.ONGOING,
        });
        return;
      }

      await AipModel.findByIdAndUpdate(aipId, {
        status: AipStatus.FOR_IMPLEMENTATION,
      });
      return;
    }
  } catch (error) {
    console.error('Error updating AIP status:', error);
  }
}
