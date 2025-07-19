import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { AipStatus } from './aip-status.enum';

@Schema({ timestamps: true })
export class Aip extends Document {
  @Prop({ required: true, unique: true })
  apn: number;

  @Prop({ required: true })
  schoolYear: string;

  @Prop({ required: true, unique: true })
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

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export type AipDocument = HydratedDocument<Aip>;
export const AipSchema = SchemaFactory.createForClass(Aip);
