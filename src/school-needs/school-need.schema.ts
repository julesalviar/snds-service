import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class SchoolNeed extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Aip', required: true })
  projectObjId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop()
  createdByUserId: string;

  @Prop()
  quantityNeeded: number;

  @Prop()
  unitMeasure: string;

  @Prop()
  estimatedCost: number;

  @Prop()
  numberOfBeneficiaryStudents: number;

  @Prop()
  numberOfBeneficiaryPersonnel: number;

  @Prop()
  targetImplementationDate: string;

  @Prop()
  uploadedPhotos: [{ type: String }];

  @Prop({ required: true })
  descriptionOrInfo: string;

  @Prop()
  statusOfImplementation: string;

  @Prop()
  updatedBy: string;
}

export type SchoolNeedDocument = HydratedDocument<SchoolNeed>;
export const SchoolNeedSchema = SchemaFactory.createForClass(SchoolNeed);
