import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'immersion_info' })
export class ImmersionInfo extends Document {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  immersionCode: number;

  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  track: string;

  @Prop({ required: true })
  strand: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  requiredHours: number;

  @Prop()
  totalMaleBeneficiary: number;

  @Prop()
  totalFMaleBeneficiary: number;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  @Prop({
    type: String,
    match: /^\d{4}-\d{4}$/, // Optional: basic format validation
  })
  schoolYear?: string;
}

export type ImmersionInfoDocument = HydratedDocument<ImmersionInfo>;
export const ImmersionInfoSchema = SchemaFactory.createForClass(ImmersionInfo);
