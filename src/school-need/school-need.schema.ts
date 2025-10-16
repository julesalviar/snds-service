import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { AipStatus } from '../aip/aip-status.enum';
import { ImplementationStatus } from './implementation-status.enum';
import { AipSchema } from '../aip/aip.schema';

export class Image {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  thumbnailUrl: string;
}

@Schema({ timestamps: true, collection: 'school_needs' })
export class SchoolNeed extends Document {
  @Prop({ type: [Types.ObjectId], ref: 'Aip', required: true })
  projectId: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop()
  description: string;

  @Prop({ required: true })
  contributionType: string;

  @Prop({ required: true })
  specificContribution: string;

  @Prop()
  quantity: number;

  @Prop()
  unit: string;

  @Prop()
  estimatedCost: number;

  @Prop()
  studentBeneficiaries: number;

  @Prop()
  personnelBeneficiaries: number;

  @Prop()
  targetDate: string;

  @Prop({ type: [Image], default: [] })
  images: Image[];

  @Prop({
    type: String,
  })
  implementationStatus: string;

  @Prop({
    type: String,
    match: /^\d{4}-\d{4}$/,
  })
  schoolYear?: string;
}

export type SchoolNeedDocument = HydratedDocument<SchoolNeed>;
export const SchoolNeedSchema = SchemaFactory.createForClass(SchoolNeed);

SchoolNeedSchema.index({ schoolId: 1 });
SchoolNeedSchema.index({ projectId: 1 });
SchoolNeedSchema.index({ schoolYear: 1 });

// Helper function to update AIP status based on linked school needs
async function updateAipStatus(aipId: Types.ObjectId, doc: any) {
  try {
    // Ensure models are registered on the connection
    let AipModel;
    let SchoolNeedModel;

    try {
      AipModel = doc.db.model('Aip');
    } catch (error) {
      AipModel = doc.db.model('Aip', AipSchema);
    }

    try {
      SchoolNeedModel = doc.db.model('SchoolNeed');
    } catch (error) {
      SchoolNeedModel = doc.db.model('SchoolNeed', SchoolNeedSchema);
    }

    // Get all school needs linked to this AIP
    const schoolNeeds = await SchoolNeedModel.find({
      projectId: aipId,
    }).exec();

    // If no school needs are linked, keep status as CREATED
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

    // Check if school year has ended (May 31st)
    const schoolYearMatch = aip.schoolYear.match(/^(\d{4})-(\d{4})$/);
    if (schoolYearMatch) {
      const endYear = parseInt(schoolYearMatch[2]);
      const schoolYearEndDate = new Date(endYear, 4, 31); // May 31st (month is 0-indexed)
      const currentDate = new Date();

      // UNIMPLEMENTED: school year has ended and no needs are completed
      if (currentDate > schoolYearEndDate && completedCount === 0) {
        await AipModel.findByIdAndUpdate(aipId, {
          status: AipStatus.UNIMPLEMENTED,
        });
        return;
      }

      // INCOMPLETE: school year has ended and some (but not all) school needs are completed
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

    // COMPLETED: all school needs are completed
    if (completedCount === totalCount) {
      await AipModel.findByIdAndUpdate(aipId, { status: AipStatus.COMPLETED });
      return;
    }

    // ONGOING: school needs exist but none are completed yet
    await AipModel.findByIdAndUpdate(aipId, { status: AipStatus.ONGOING });
  } catch (error) {
    console.error('Error updating AIP status:', error);
    // Silently fail to avoid breaking the main operation
  }
}

// Middleware: After creating a school need
SchoolNeedSchema.post('save', async function (doc) {
  if (doc.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc);
    }
  }
});

// Middleware: After updating a school need (covers findByIdAndUpdate as well)
SchoolNeedSchema.post('findOneAndUpdate', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc);
    }
  }
});

// Middleware: After deleting a school need (covers findByIdAndDelete as well)
SchoolNeedSchema.post('findOneAndDelete', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc);
    }
  }
});
