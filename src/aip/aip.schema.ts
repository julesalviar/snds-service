import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { AipStatus } from './aip-status.enum';

@Schema({ timestamps: true })
export class Aip extends Document {
  @Prop({ required: true, unique: true })
  apn: number;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true })
  schoolYear: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  objectives: string;

  @Prop()
  pillars: string;

  @Prop()
  materialsNeeded: string;

  @Prop()
  totalBudget: string;

  @Prop()
  budgetSource: string;

  @Prop({ required: true })
  responsiblePerson: string;

  @Prop({
    type: String,
    enum: AipStatus,
    default: AipStatus.CREATED,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  updatedBy: string;
}

export type AipDocument = HydratedDocument<Aip>;
export const AipSchema = SchemaFactory.createForClass(Aip);
AipSchema.index({ title: 1, schoolId: 1, schoolYear: 1 }, { unique: true });
