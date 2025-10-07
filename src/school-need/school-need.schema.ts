import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { StakeHolderEngageDto } from 'src/school-need/stakeholder-engage.dto';

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
  @Prop({ type: Types.ObjectId, ref: 'Aip', required: true })
  projectId: Types.ObjectId;

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

  @Prop()
  implementationStatus: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;

  @Prop({
    type: String,
    match: /^\d{4}-\d{4}$/, // Optional: basic format validation
  })
  schoolYear?: string;
}

export type SchoolNeedDocument = HydratedDocument<SchoolNeed>;
export const SchoolNeedSchema = SchemaFactory.createForClass(SchoolNeed);
