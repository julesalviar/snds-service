import { Schema, Types } from 'mongoose';

import { AipStatus } from '../aip/aip-status.enum';
import { AipSchema } from '../aip/aip.schema';
import { ImplementationStatus } from './implementation-status.enum';

interface UpdateAipStatusOptions {
  SchoolNeedSchema?: Schema;
  AipSchema?: Schema;
}

export async function updateAipStatus(
  aipId: Types.ObjectId,
  doc: any,
  options: UpdateAipStatusOptions = {},
) {
  const { SchoolNeedSchema: schoolNeedSchemaOption, AipSchema: aipSchemaOption } =
    options;

  try {
    let AipModel;
    let SchoolNeedModel;

    try {
      AipModel = doc.db.model('Aip');
    } catch (error) {
      AipModel = doc.db.model('Aip', aipSchemaOption ?? AipSchema);
    }

    try {
      SchoolNeedModel = doc.db.model('SchoolNeed');
    } catch (error) {
      if (!schoolNeedSchemaOption) {
        throw new Error('SchoolNeedSchema is required to register the model');
      }
      SchoolNeedModel = doc.db.model('SchoolNeed', schoolNeedSchemaOption);
    }

    const schoolNeeds = await SchoolNeedModel.find({
      projectId: aipId,
    }).exec();

    if (!schoolNeeds || schoolNeeds.length === 0) {
      await AipModel.findByIdAndUpdate(aipId, { status: AipStatus.CREATED });
      return;
    }

    const aip = await AipModel.findById(aipId).exec();
    if (!aip) return;

    const completedCount = schoolNeeds.filter(
      (need) => need.implementationStatus === ImplementationStatus.COMPLETED,
    ).length;

    const totalCount = schoolNeeds.length;

    const schoolYearMatch = aip.schoolYear?.match(/^(\d{4})-(\d{4})$/);
    if (schoolYearMatch) {
      const endYear = parseInt(schoolYearMatch[2]);
      const schoolYearEndDate = new Date(endYear, 4, 31);
      const currentDate = new Date();

      if (currentDate > schoolYearEndDate && completedCount === 0) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.UNIMPLEMENTED,
        });
        return;
      }

      if (
        currentDate > schoolYearEndDate &&
        completedCount > 0 &&
        completedCount < totalCount
      ) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.INCOMPLETE,
        });
        return;
      }
    }

    if (completedCount === totalCount) {
      await AipModel.findByIdAndUpdate(aipId, { status: AipStatus.COMPLETED });
      return;
    }

    await AipModel.findByIdAndUpdate(aipId, { status: AipStatus.ONGOING });
  } catch (error) {
    console.error('Error updating AIP status:', error);
  }
}


