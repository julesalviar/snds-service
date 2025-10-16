import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import {
  ImplementationStatus,
  getPercentageComplete,
} from '../school-need/implementation-status.enum';
import { SchoolNeedSchema } from '../school-need/school-need.schema';

@Schema({ timestamps: true, collection: 'engagements' })
export class Engagement extends Document {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  stakeholderUserId: Types.ObjectId;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  signingDate: string;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop({ type: Types.ObjectId, ref: 'SchoolNeed' })
  schoolNeedId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    match: /^\d{4}-\d{4}$/, // Format validation: YYYY-YYYY
  })
  schoolYear: string;

  @Prop({ required: true })
  specificContribution: string;
}

export type EngagementDocument = HydratedDocument<Engagement>;
export const EngagementSchema = SchemaFactory.createForClass(Engagement);

// Helper function to update school need implementation status based on engagement quantities
async function updateSchoolNeedStatus(schoolNeedId: Types.ObjectId, doc: any) {
  try {
    // Ensure models are registered on the connection
    let SchoolNeedModel;
    let EngagementModel;

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

    // Get the school need
    const schoolNeed = await SchoolNeedModel.findById(schoolNeedId).exec();
    if (!schoolNeed || !schoolNeed.quantity) return;

    // Get all engagements linked to this school need
    const engagements = await EngagementModel.find({
      schoolNeedId: schoolNeedId,
    }).exec();

    // Sum all engagement quantities
    const totalEngagementQuantity = engagements.reduce(
      (sum, engagement) => sum + (engagement.quantity || 0),
      0,
    );

    // Calculate the fulfillment ratio and percentage
    const fulfillmentRatio = totalEngagementQuantity / schoolNeed.quantity;
    const percentage = fulfillmentRatio * 100;

    // Update school need implementation status based on the ratio
    if (totalEngagementQuantity === 0) {
      // No engagements linked, set to LOOKING_FOR_PARTNER
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: ImplementationStatus.LOOKING_FOR_PARTNER,
      });
    } else if (fulfillmentRatio >= 1) {
      // Fully fulfilled or overfulfilled, set to COMPLETED
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: ImplementationStatus.COMPLETED,
      });
    } else {
      // Partially fulfilled, set percentage complete (e.g., "45% Complete")
      await SchoolNeedModel.findByIdAndUpdate(schoolNeedId, {
        implementationStatus: getPercentageComplete(percentage),
      });
    }
  } catch (error) {
    console.error('Error updating school need status:', error);
    // Silently fail to avoid breaking the main operation
  }
}

// Middleware: After creating an engagement
EngagementSchema.post('save', async function (doc) {
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
