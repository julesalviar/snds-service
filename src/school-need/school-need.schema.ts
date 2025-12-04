import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { AipSchema } from '../aip/aip.schema';
import { EngagementSchema } from '../engagement/engagement.schema';
import { updateAipStatus } from './update-aip-status.helper';

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

// Middleware: After creating a school need
SchoolNeedSchema.post('save', async function (doc) {
  if (doc.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});

// Middleware: After updating a school need (covers findByIdAndUpdate as well)
SchoolNeedSchema.post('findOneAndUpdate', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});

// Middleware: After deleting a school need (covers findByIdAndDelete as well)
SchoolNeedSchema.post('findOneAndDelete', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});
