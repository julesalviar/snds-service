import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

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

  @Prop()
  stakeholderRepCount: number;

  @Prop()
  agreementType: string;

  @Prop()
  signatoryName: string;

  @Prop()
  signatoryDesignation: string;

  @Prop()
  projectCategory: string;

  @Prop()
  projectName: string;

  @Prop()
  agreementStatus: string;

  @Prop()
  initiatedBy: string;
}

export type EngagementDocument = HydratedDocument<Engagement>;
export const EngagementSchema = SchemaFactory.createForClass(Engagement);
