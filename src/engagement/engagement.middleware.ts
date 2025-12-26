import { Types } from 'mongoose';
import { SchoolNeedSchema } from 'src/school-need/school-need.schema';
import {
  getPercentageComplete,
  ImplementationStatus,
} from 'src/school-need/implementation-status.enum';
import { updateAipStatus } from 'src/school-need/update-aip-status.helper';
import { EngagementSchema } from 'src/engagement/engagement.schema';

// Helper function to update school need implementation status based on engagement quantities
async function updateSchoolNeedStatus(schoolNeedId: Types.ObjectId, doc: any) {
  try {
    // Ensure models are registered on the connection
    let SchoolNeedModel;
    let EngagementModel;

    try {
      SchoolNeedModel = doc.db.model('SchoolNeed');
    } catch (error) {
      console.log(error);
      SchoolNeedModel = doc.db.model('SchoolNeed', SchoolNeedSchema);
    }

    try {
      EngagementModel = doc.db.model('Engagement');
    } catch (error) {
      console.log(error);
      EngagementModel = doc.db.model('Engagement', EngagementSchema);
    }

    // Get the school need
    const schoolNeed = await SchoolNeedModel.findById(schoolNeedId).exec();
    if (!schoolNeed?.quantity) return;

    // Get all engagements linked to this school need
    const engagements = await EngagementModel.find({
      schoolNeedId: schoolNeedId,
    }).exec();

    const totalEngagementQuantity = engagements.reduce(
      (sum, engagement) => sum + (engagement.quantity || 0),
      0,
    );

    const fulfillmentRatio = totalEngagementQuantity / schoolNeed.quantity;
    const percentage = fulfillmentRatio * 100;

    if (totalEngagementQuantity === 0) {
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: ImplementationStatus.LOOKING_FOR_PARTNER,
      });
    } else if (fulfillmentRatio >= 1) {
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: ImplementationStatus.COMPLETED,
      });
    } else {
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: getPercentageComplete(percentage),
      });
    }

    if (
      Array.isArray(schoolNeed.projectId) &&
      schoolNeed.projectId.length > 0
    ) {
      for (const aipId of schoolNeed.projectId) {
        await updateAipStatus(aipId, doc, {
          SchoolNeedSchema,
          EngagementSchema,
        });
      }
    }
  } catch (error) {
    console.error('Error updating school need status:', error);
    // Silently fail to avoid breaking the main operation
  }
}

// Middleware: After creating an engagement
EngagementSchema.post('save', async function (doc) {
  console.log('Engagement saved:', doc);
  if (doc.schoolNeedId) {
    await updateSchoolNeedStatus(doc.schoolNeedId, doc);
  }
});

// Middleware: After updating an engagement (covers findByIdAndUpdate as well)
EngagementSchema.post('findOneAndUpdate', async function (doc) {
  if (doc?.schoolNeedId) {
    await updateSchoolNeedStatus(doc.schoolNeedId, doc);
  }
});

// Middleware: After deleting an engagement (covers findByIdAndDelete as well)
EngagementSchema.post('findOneAndDelete', async function (doc) {
  if (doc?.schoolNeedId) {
    await updateSchoolNeedStatus(doc.schoolNeedId, doc);
  }
});
